const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { authenticate, requireEmployer } = require('../middleware/auth');
const { validateCompanyCreation, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies with search and filters
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const {
      q: query,
      industry,
      size,
      location,
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    // Build search filters
    const filters = {};
    
    if (industry) filters.industry = industry;
    if (size) filters.size = size;
    if (location) {
      filters.$or = [
        { 'headquarters.city': { $regex: location, $options: 'i' } },
        { 'headquarters.country': { $regex: location, $options: 'i' } }
      ];
    }
    if (minRating) filters['stats.averageRating'] = { $gte: parseFloat(minRating) };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    let companies;
    if (query) {
      // Text search with filters
      companies = await Company.find({
        $text: { $search: query },
        ...filters,
        isActive: true
      })
      .sort({ score: { $meta: 'textScore' }, 'stats.averageRating': -1 })
      .skip(skip)
      .limit(parseInt(limit));
    } else {
      // Regular search with filters
      companies = await Company.find({
        ...filters,
        isActive: true
      })
      .sort({ 'stats.averageRating': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    }

    // Get total count for pagination
    const totalCompanies = await Company.countDocuments({
      ...filters,
      isActive: true,
      ...(query && { $text: { $search: query } })
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCompanies / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCompanies,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching companies'
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company by ID
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!company.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not available'
      });
    }

    // Get recent jobs for this company
    const recentJobs = await Job.find({
      company: company._id,
      isActive: true
    })
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        company,
        recentJobs
      }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company'
    });
  }
});

// @route   POST /api/companies
// @desc    Create a new company
// @access  Private (Employer)
router.post('/', authenticate, requireEmployer, validateCompanyCreation, async (req, res) => {
  try {
    // Check if company already exists
    const existingCompany = await Company.findOne({ name: req.body.name });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    // Create company with current user as owner
    const companyData = {
      ...req.body,
      admins: [{
        user: req.user._id,
        role: 'owner'
      }]
    };

    const company = new Company(companyData);
    await company.save();

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating company'
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private (Company Admin)
router.put('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is admin of this company
    if (!company.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this company'
      });
    }

    // Update company
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'admins') {
        company[key] = req.body[key];
      }
    });

    await company.save();

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: {
        company
      }
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating company'
    });
  }
});

// @route   GET /api/companies/:id/jobs
// @desc    Get jobs for a specific company
// @access  Public
router.get('/:id/jobs', validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const filters = { company: req.params.id };
    if (status === 'active') {
      filters.isActive = true;
    } else if (status === 'inactive') {
      filters.isActive = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(filters)
      .populate('postedBy', 'name email')
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
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company jobs'
    });
  }
});

// @route   POST /api/companies/:id/add-admin
// @desc    Add admin to company
// @access  Private (Company Owner)
router.post('/:id/add-admin', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { userId, role = 'recruiter' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner
    if (!company.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only company owners can add admins'
      });
    }

    // Check if user exists
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add admin
    await company.addAdmin(userId, role);

    res.json({
      success: true,
      message: 'Admin added successfully'
    });
  } catch (error) {
    console.error('Add admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding admin'
    });
  }
});

// @route   DELETE /api/companies/:id/remove-admin/:adminId
// @desc    Remove admin from company
// @access  Private (Company Owner)
router.delete('/:id/remove-admin/:adminId', authenticate, validateObjectId('id'), validateObjectId('adminId'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner
    if (!company.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only company owners can remove admins'
      });
    }

    // Remove admin
    await company.removeAdmin(req.params.adminId);

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing admin'
    });
  }
});

// @route   GET /api/companies/employer/my-companies
// @desc    Get companies managed by current employer
// @access  Private (Employer)
router.get('/employer/my-companies', authenticate, requireEmployer, async (req, res) => {
  try {
    const companies = await Company.find({
      'admins.user': req.user._id,
      isActive: true
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        companies
      }
    });
  } catch (error) {
    console.error('Get my companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching companies'
    });
  }
});

// @route   GET /api/companies/industries
// @desc    Get company industries with counts
// @access  Public
router.get('/industries', async (req, res) => {
  try {
    const industries = await Company.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        industries
      }
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching industries'
    });
  }
});

module.exports = router;
