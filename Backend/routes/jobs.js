const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { authenticate, requireEmployer, optionalAuth } = require('../middleware/auth');
const { 
  validateJobCreation, 
  validateJobUpdate, 
  validateJobSearch, 
  validatePagination,
  validateObjectId 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with search and filters
// @access  Public
router.get('/', optionalAuth, validateJobSearch, validatePagination, async (req, res) => {
  try {
    const {
      q: query,
      category,
      type,
      location,
      minSalary,
      maxSalary,
      experienceLevel,
      companySize,
      skills,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build search filters
    const filters = {};
    
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (location) filters.location = { $regex: location, $options: 'i' };
    if (minSalary) filters['salary.min'] = { $gte: parseInt(minSalary) };
    if (maxSalary) filters['salary.max'] = { $lte: parseInt(maxSalary) };
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (companySize) filters.companySize = companySize;
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filters.skills = { $in: skillsArray };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    let jobs;
    if (query) {
      // Text search with filters
      jobs = await Job.find({
        $text: { $search: query },
        ...filters,
        isActive: true
      })
      .populate('company', 'name logo website industry')
      .populate('postedBy', 'name email')
      .sort({ score: { $meta: 'textScore' }, ...sortObj })
      .skip(skip)
      .limit(parseInt(limit));
    } else {
      // Regular search with filters
      jobs = await Job.find({
        ...filters,
        isActive: true
      })
      .populate('company', 'name logo website industry')
      .populate('postedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    }

    // Get total count for pagination
    const totalJobs = await Job.countDocuments({
      ...filters,
      isActive: true,
      ...(query && { $text: { $search: query } })
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
});

// @route   GET /api/jobs/featured
// @desc    Get featured jobs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({
      isActive: true,
      isFeatured: true
    })
    .populate('company', 'name logo website industry')
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({
      success: true,
      data: {
        jobs: featuredJobs
      }
    });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured jobs'
    });
  }
});

// @route   GET /api/jobs/categories
// @desc    Get job categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo website industry description')
      .populate('postedBy', 'name email avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job is no longer available'
      });
    }

    // Increment view count
    await job.incrementViewCount();

    // Check if user has already applied (if authenticated)
    let hasApplied = false;
    if (req.user) {
      const existingApplication = await Application.findOne({
        job: job._id,
        applicant: req.user._id
      });
      hasApplied = !!existingApplication;
    }

    res.json({
      success: true,
      data: {
        job,
        hasApplied
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Employer)
router.post('/', authenticate, requireEmployer, validateJobCreation, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    // Find or create company
    let company = await Company.findOne({ name: req.body.companyName });
    if (!company) {
      company = new Company({
        name: req.body.companyName,
        admins: [{
          user: req.user._id,
          role: 'owner'
        }]
      });
      await company.save();
    } else {
      // Check if user is admin of this company
      if (!company.isAdmin(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to post jobs for this company'
        });
      }
    }

    jobData.company = company._id;

    const job = new Job(jobData);
    await job.save();

    // Update company job stats
    await company.updateJobStats();

    // Populate the job data
    await job.populate('company', 'name logo website industry');
    await job.populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Employer - Job Owner)
router.put('/:id', authenticate, requireEmployer, validateObjectId('id'), validateJobUpdate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or company admin
    const company = await Company.findById(job.company);
    if (job.postedBy.toString() !== req.user._id.toString() && !company.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job'
      });
    }

    // Update job
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key];
      }
    });

    await job.save();

    // Populate the job data
    await job.populate('company', 'name logo website industry');
    await job.populate('postedBy', 'name email');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer - Job Owner)
router.delete('/:id', authenticate, requireEmployer, validateObjectId('id'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or company admin
    const company = await Company.findById(job.company);
    if (job.postedBy.toString() !== req.user._id.toString() && !company.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job'
      });
    }

    // Permanently delete the job from MongoDB
    await Job.findByIdAndDelete(req.params.id);

    // Update company job stats
    await company.updateJobStats();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by current employer
// @access  Private (Employer)
router.get('/employer/my-jobs', authenticate, requireEmployer, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filters = { postedBy: req.user._id };
    if (status !== 'all') {
      filters.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(filters)
      .populate('company', 'name logo website')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filters);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employer jobs'
    });
  }
});

// @route   POST /api/jobs/:id/toggle-featured
// @desc    Toggle featured status of a job
// @access  Private (Employer - Job Owner)
router.post('/:id/toggle-featured', authenticate, requireEmployer, validateObjectId('id'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or company admin
    const company = await Company.findById(job.company);
    if (job.postedBy.toString() !== req.user._id.toString() && !company.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this job'
      });
    }

    job.isFeatured = !job.isFeatured;
    await job.save();

    res.json({
      success: true,
      message: `Job ${job.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        isFeatured: job.isFeatured
      }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling featured status'
    });
  }
});

module.exports = router;
