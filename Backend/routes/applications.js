const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { authenticate, requireJobseeker, requireEmployer } = require('../middleware/auth');
const { validateApplication, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Jobseeker)
router.post('/', authenticate, requireJobseeker, validateApplication, async (req, res) => {
  try {
    const { jobId, coverLetter, resume, expectedSalary, portfolio, linkedin, github, website, availability, additionalInfo } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume,
      expectedSalary,
      portfolio,
      linkedin,
      github,
      website,
      additionalInfo,
      availableFrom: availability ? new Date() : undefined
    });

    await application.save();

    // Increment job application count
    await job.incrementApplicationCount();

    // Populate application data
    await application.populate('job', 'title companyName location salary type category');
    await application.populate('applicant', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get current user's applications
// @access  Private (Jobseeker)
router.get('/my-applications', authenticate, requireJobseeker, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filters = { applicant: req.user._id };
    if (status !== 'all') {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filters)
      .populate('job', 'title companyName location salary type category postedDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(filters);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Get application statistics
    const stats = await Application.getStats({ applicant: req.user._id });

    res.json({
      success: true,
      data: {
        applications,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @route   GET /api/applications/user/:userId
// @desc    Get all applications for a specific user
// @access  Private (Jobseeker - Own Applications or Employer - Applications for their jobs)
router.get('/user/:userId', authenticate, validateObjectId('userId'), async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'all' } = req.query;
    
    // Check if user is accessing their own applications or is an employer viewing applications for their jobs
    const isOwnApplications = req.user._id.toString() === req.params.userId;
    const isEmployer = req.user.userType === 'employer';
    
    let filters = {};
    
    if (isOwnApplications) {
      // User accessing their own applications
      filters = { applicant: req.params.userId };
    } else if (isEmployer) {
      // Employer accessing applications for jobs they posted
      const jobs = await Job.find({ postedBy: req.user._id });
      const jobIds = jobs.map(job => job._id);
      filters = { 
        applicant: req.params.userId,
        job: { $in: jobIds }
      };
    } else {
      // Unauthorized access
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own applications.'
      });
    }
    
    if (status !== 'all') {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filters)
      .populate('job', 'title companyName location salary type category postedDate isActive')
      .populate('applicant', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(filters);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Get application statistics
    const stats = await Application.getStats({ applicant: req.params.userId });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user applications'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private (Jobseeker - Own Application or Employer - Job Owner)
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title companyName location salary type category postedBy')
      .populate('applicant', 'name email avatar profile')
      .populate('interview.interviewer', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user has access to this application
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isJobPoster = application.job.postedBy.toString() === req.user._id.toString();
    const isCompanyAdmin = req.user.userType === 'employer' && 
      await require('../models/Company').findById(application.job.company).then(company => 
        company && company.isAdmin(req.user._id)
      );

    if (!isApplicant && !isJobPoster && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer - Job Owner)
router.put('/:id/status', authenticate, requireEmployer, validateObjectId('id'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to update this application
    const isJobPoster = application.job.postedBy.toString() === req.user._id.toString();
    const isCompanyAdmin = await require('../models/Company').findById(application.job.company).then(company => 
      company && company.isAdmin(req.user._id)
    );

    if (!isJobPoster && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this application'
      });
    }

    // Update status
    await application.updateStatus(status, req.user._id, notes);

    // Populate updated application
    await application.populate('job', 'title companyName location');
    await application.populate('applicant', 'name email avatar');

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
});

// @route   POST /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Jobseeker - Own Application)
router.post('/:id/withdraw', authenticate, requireJobseeker, validateObjectId('id'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications'
      });
    }

    // Check if application can be withdrawn
    if (['withdrawn', 'offered', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'This application cannot be withdrawn'
      });
    }

    // Update status to withdrawn
    await application.updateStatus('withdrawn', req.user._id, 'Withdrawn by applicant');

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while withdrawing application'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job
// @access  Private (Employer - Job Owner)
router.get('/job/:jobId', authenticate, requireEmployer, validateObjectId('jobId'), validatePagination, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Check if job exists and user owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or company admin
    const isJobPoster = job.postedBy.toString() === req.user._id.toString();
    const isCompanyAdmin = await require('../models/Company').findById(job.company).then(company => 
      company && company.isAdmin(req.user._id)
    );

    if (!isJobPoster && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this job'
      });
    }

    const filters = { job: jobId };
    if (status !== 'all') {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filters)
      .populate('applicant', 'name email avatar profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(filters);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Get application statistics for this job
    const stats = await Application.getStats({ job: jobId });

    res.json({
      success: true,
      data: {
        applications,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job applications'
    });
  }
});

// @route   POST /api/applications/:id/note
// @desc    Add internal note to application
// @access  Private (Employer - Job Owner)
router.post('/:id/note', authenticate, requireEmployer, validateObjectId('id'), async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to add notes
    const isJobPoster = application.job.postedBy.toString() === req.user._id.toString();
    const isCompanyAdmin = await require('../models/Company').findById(application.job.company).then(company => 
      company && company.isAdmin(req.user._id)
    );

    if (!isJobPoster && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add notes to this application'
      });
    }

    // Add note
    await application.addInternalNote(note, req.user._id);

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add application note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
});

// @route   POST /api/applications/:id/communication
// @desc    Add communication to application
// @access  Private (Employer - Job Owner)
router.post('/:id/communication', authenticate, requireEmployer, validateObjectId('id'), async (req, res) => {
  try {
    const { type, content, direction = 'outbound' } = req.body;

    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type and content are required'
      });
    }

    const validTypes = ['email', 'phone', 'message', 'note'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid communication type'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to add communications
    const isJobPoster = application.job.postedBy.toString() === req.user._id.toString();
    const isCompanyAdmin = await require('../models/Company').findById(application.job.company).then(company => 
      company && company.isAdmin(req.user._id)
    );

    if (!isJobPoster && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add communications to this application'
      });
    }

    // Add communication
    await application.addCommunication(type, content, direction, req.user._id);

    res.json({
      success: true,
      message: 'Communication added successfully'
    });
  } catch (error) {
    console.error('Add application communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding communication'
    });
  }
});

// @route   GET /api/applications/employer/dashboard
// @desc    Get employer dashboard data
// @access  Private (Employer)
router.get('/employer/dashboard', authenticate, requireEmployer, async (req, res) => {
  try {
    // Get jobs posted by this employer
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(job => job._id);

    // Get application statistics
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const pendingApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'pending' 
    });
    const reviewedApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'reviewed' 
    });
    const shortlistedApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'shortlisted' 
    });
    const offeredApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'offered' 
    });

    // Get recent applications
    const recentApplications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title companyName')
      .populate('applicant', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter(job => job.isActive).length,
          totalApplications,
          pendingApplications,
          reviewedApplications,
          shortlistedApplications,
          offeredApplications
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get employer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

module.exports = router;
