const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    period: {
      type: String,
      default: 'yearly',
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly']
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology',
      'Marketing',
      'Data Science',
      'Design',
      'Management',
      'Sales',
      'Finance',
      'Healthcare',
      'Education',
      'Engineering',
      'Customer Service',
      'Human Resources',
      'Operations',
      'Other'
    ]
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance', 'Internship']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
  },
  companySize: {
    type: String,
    enum: ['Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Enterprise (1000+)'],
    default: 'Medium (51-500)'
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot be more than 200 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot be more than 50 characters']
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each benefit cannot be more than 200 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [300, 'Each responsibility cannot be more than 300 characters']
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  applicationDeadline: {
    type: Date,
    default: function() {
      // Default to 30 days from now
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ salary: 1 });

// Virtual for formatted salary display
jobSchema.virtual('salaryDisplay').get(function() {
  // Check if salary exists and has required fields
  if (!this.salary || typeof this.salary !== 'object') {
    return 'Salary not specified';
  }
  
  const { min, max, currency, period } = this.salary;
  
  // Check if min and max are valid numbers
  if (typeof min !== 'number' || typeof max !== 'number' || isNaN(min) || isNaN(max)) {
    return 'Salary not specified';
  }
  
  const formatNumber = (num) => {
    // Additional safety check
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  const currencyDisplay = currency || 'USD';
  const periodDisplay = period || 'year';
  
  return `${currencyDisplay} ${formatNumber(min)} - ${formatNumber(max)} per ${periodDisplay}`;
});

// Virtual for time since posted
jobSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMs = now - this.createdAt;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
});

// Method to increment view count
jobSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment application count
jobSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

// Static method to search jobs
jobSchema.statics.searchJobs = function(query, filters = {}) {
  const searchQuery = { isActive: true };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.type) {
    searchQuery.type = filters.type;
  }
  
  if (filters.location) {
    searchQuery.location = { $regex: filters.location, $options: 'i' };
  }
  
  if (filters.experienceLevel) {
    searchQuery.experienceLevel = filters.experienceLevel;
  }
  
  if (filters.minSalary) {
    searchQuery['salary.min'] = { $gte: filters.minSalary };
  }
  
  if (filters.maxSalary) {
    searchQuery['salary.max'] = { $lte: filters.maxSalary };
  }
  
  if (filters.companySize) {
    searchQuery.companySize = filters.companySize;
  }
  
  if (filters.skills && filters.skills.length > 0) {
    searchQuery.skills = { $in: filters.skills };
  }
  
  return this.find(searchQuery)
    .populate('company', 'name logo website')
    .populate('postedBy', 'name email')
    .sort({ isFeatured: -1, createdAt: -1 });
};

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
