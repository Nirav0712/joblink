const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check if user is jobseeker
const requireJobseeker = (req, res, next) => {
  if (req.user.userType !== 'jobseeker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Jobseeker account required.'
    });
  }
  next();
};

// Middleware to check if user is employer
const requireEmployer = (req, res, next) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Employer account required.'
    });
  }
  next();
};

// Middleware to check if user is admin of a company
const requireCompanyAdmin = async (req, res, next) => {
  try {
    const Company = require('../models/Company');
    const companyId = req.params.companyId || req.body.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required.'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.'
      });
    }

    if (!company.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company admin privileges required.'
      });
    }

    req.company = company;
    next();
  } catch (error) {
    console.error('Company admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

// Middleware to check if user owns the resource
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: `${resourceField} is required.`
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  authenticate,
  requireJobseeker,
  requireEmployer,
  requireCompanyAdmin,
  requireOwnership,
  optionalAuth,
  generateToken
};
