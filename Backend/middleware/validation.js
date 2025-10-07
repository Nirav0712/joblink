const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('userType')
    .isIn(['jobseeker', 'employer'])
    .withMessage('User type must be either jobseeker or employer'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('userType')
    .optional()
    .isIn(['jobseeker', 'employer'])
    .withMessage('User type must be either jobseeker or employer'),
  
  handleValidationErrors
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('profile.phone')
    .optional()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length < 10 || value.length > 15) {
          throw new Error('Phone number must be between 10 and 15 characters');
        }
      }
      return true;
    }),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('profile.skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  body('profile.portfolio')
    .optional()
    .isURL()
    .withMessage('Portfolio must be a valid URL'),
  
  body('profile.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),
  
  body('profile.github')
    .optional()
    .isURL()
    .withMessage('GitHub must be a valid URL'),
  
  handleValidationErrors
];

// Job validation rules
const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('salary.min')
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum salary must be positive'),
  
  body('salary.max')
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum salary must be positive'),
  
  body('category')
    .isIn([
      'Technology', 'Marketing', 'Data Science', 'Design', 'Management',
      'Sales', 'Finance', 'Healthcare', 'Education', 'Engineering',
      'Customer Service', 'Human Resources', 'Operations', 'Other'
    ])
    .withMessage('Invalid job category'),
  
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance', 'Internship'])
    .withMessage('Invalid job type'),
  
  body('experienceLevel')
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive'])
    .withMessage('Invalid experience level'),
  
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('requirements.*')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Each requirement must be between 5 and 200 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  handleValidationErrors
];

const validateJobUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum salary must be positive'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum salary must be positive'),
  
  handleValidationErrors
];

// Application validation rules
const validateApplication = [
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot be more than 2000 characters'),
  
  body('resume')
    .notEmpty()
    .withMessage('Resume is required'),
  
  body('expectedSalary')
    .optional()
    .isNumeric()
    .withMessage('Expected salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Expected salary must be positive'),
  
  body('portfolio')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Portfolio must be a valid URL');
        }
      }
      return true;
    }),
  
  body('linkedin')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('LinkedIn must be a valid URL');
        }
      }
      return true;
    }),
  
  body('github')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('GitHub must be a valid URL');
        }
      }
      return true;
    }),
  
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Website must be a valid URL');
        }
      }
      return true;
    }),
  
  body('availability')
    .optional()
    .isIn(['immediately', '2-weeks', '1-month', '2-months', '3-months'])
    .withMessage('Availability must be one of: immediately, 2-weeks, 1-month, 2-months, 3-months'),
  
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional information cannot be more than 1000 characters'),
  
  handleValidationErrors
];

// Company validation rules
const validateCompanyCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('industry')
    .optional()
    .isIn([
      'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
      'Retail', 'Consulting', 'Media', 'Real Estate', 'Transportation',
      'Energy', 'Government', 'Non-profit', 'Other'
    ])
    .withMessage('Invalid industry'),
  
  body('size')
    .optional()
    .isIn(['Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Enterprise (1000+)'])
    .withMessage('Invalid company size'),
  
  body('founded')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Founded year must be between 1800 and current year'),
  
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('contact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateJobSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isIn([
      'Technology', 'Marketing', 'Data Science', 'Design', 'Management',
      'Sales', 'Finance', 'Healthcare', 'Education', 'Engineering',
      'Customer Service', 'Human Resources', 'Operations', 'Other'
    ])
    .withMessage('Invalid category filter'),
  
  query('type')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance', 'Internship'])
    .withMessage('Invalid job type filter'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location filter must be between 2 and 100 characters'),
  
  query('minSalary')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  query('maxSalary')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  
  query('experienceLevel')
    .optional()
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive'])
    .withMessage('Invalid experience level filter'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateJobCreation,
  validateJobUpdate,
  validateApplication,
  validateCompanyCreation,
  validatePagination,
  validateJobSearch,
  validateObjectId
};
