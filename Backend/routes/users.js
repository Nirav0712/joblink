const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate, requireOwnership } = require('../middleware/auth');
const { validateProfileUpdate, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userData = req.user.getPublicProfile();
    
    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticate, validateProfileUpdate, async (req, res) => {
  try {
    console.log('🔄 Profile update request received');
    console.log('👤 User ID:', req.user._id);
    console.log('📝 Update data:', req.body);
    
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.email;
    delete updateData.password;
    delete updateData.userType;
    delete updateData.isActive;
    delete updateData.isEmailVerified;

    // Update user
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'profile' && typeof updateData[key] === 'object') {
          // Merge profile data
          req.user.profile = { ...req.user.profile, ...updateData[key] };
        } else {
          req.user[key] = updateData[key];
        }
      }
    });

    await req.user.save();
    console.log('✅ Profile saved to database');

    const userData = req.user.getPublicProfile();
    console.log('📤 Sending updated user data:', userData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID (public info only)
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User profile not available'
      });
    }

    // Return only public profile information
    const publicProfile = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      userType: user.userType,
      profile: {
        bio: user.profile.bio,
        skills: user.profile.skills,
        experience: user.profile.experience,
        education: user.profile.education,
        portfolio: user.profile.portfolio,
        linkedin: user.profile.linkedin,
        github: user.profile.github
      },
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: {
        user: publicProfile
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @route   GET /api/users/:id/applications
// @desc    Get user's applications (if viewing own profile)
// @access  Private (Own profile only)
router.get('/:id/applications', authenticate, requireOwnership('id'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filters = { applicant: req.params.id };
    if (status !== 'all') {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filters)
      .populate('job', 'title companyName location salary type category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(filters);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

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
        }
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

// @route   GET /api/users/:id/jobs
// @desc    Get jobs posted by user (if employer)
// @access  Public
router.get('/:id/jobs', validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'employer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employer'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find({ 
      postedBy: req.params.id,
      isActive: true 
    })
    .populate('company', 'name logo website')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments({ 
      postedBy: req.params.id,
      isActive: true 
    });
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
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user jobs'
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', authenticate, async (req, res) => {
  try {
    // In a real application, you would handle file upload here
    // For now, we'll just accept a URL
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    // Validate URL
    try {
      new URL(avatarUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid avatar URL'
      });
    }

    req.user.avatar = avatarUrl;
    await req.user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
});

// @route   POST /api/users/upload-resume
// @desc    Upload user resume
// @access  Private (Jobseeker only)
router.post('/upload-resume', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        message: 'Only jobseekers can upload resumes'
      });
    }

    // In a real application, you would handle file upload here
    // For now, we'll just accept a URL
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }

    // Validate URL
    try {
      new URL(resumeUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume URL'
      });
    }

    req.user.profile.resume = resumeUrl;
    await req.user.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: req.user.profile.resume
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading resume'
    });
  }
});

// @route   GET /api/users/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/dashboard/stats', authenticate, async (req, res) => {
  try {
    let stats = {};

    if (req.user.userType === 'jobseeker') {
      // Jobseeker stats
      const totalApplications = await Application.countDocuments({ applicant: req.user._id });
      const pendingApplications = await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'pending' 
      });
      const reviewedApplications = await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'reviewed' 
      });
      const shortlistedApplications = await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'shortlisted' 
      });
      const offeredApplications = await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'offered' 
      });

      stats = {
        totalApplications,
        pendingApplications,
        reviewedApplications,
        shortlistedApplications,
        offeredApplications,
        successRate: totalApplications > 0 ? Math.round((offeredApplications / totalApplications) * 100) : 0
      };
    } else {
      // Employer stats
      const totalJobs = await Job.countDocuments({ postedBy: req.user._id });
      const activeJobs = await Job.countDocuments({ 
        postedBy: req.user._id, 
        isActive: true 
      });
      const featuredJobs = await Job.countDocuments({ 
        postedBy: req.user._id, 
        isFeatured: true 
      });

      // Get total applications for all jobs posted by this employer
      const jobs = await Job.find({ postedBy: req.user._id });
      const jobIds = jobs.map(job => job._id);
      const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
      const pendingApplications = await Application.countDocuments({ 
        job: { $in: jobIds }, 
        status: 'pending' 
      });

      stats = {
        totalJobs,
        activeJobs,
        featuredJobs,
        totalApplications,
        pendingApplications
      };
    }

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Hard delete - actually remove the user from database
    await User.findByIdAndDelete(req.user._id);

    // Also delete related applications
    await Application.deleteMany({ applicant: req.user._id });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

module.exports = router;
