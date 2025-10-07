const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  logo: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=fff&size=200`;
    }
  },
  industry: {
    type: String,
    enum: [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Media',
      'Real Estate',
      'Transportation',
      'Energy',
      'Government',
      'Non-profit',
      'Other'
    ]
  },
  size: {
    type: String,
    enum: ['Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Enterprise (1000+)'],
    default: 'Medium (51-500)'
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contact: {
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: String,
    linkedin: String,
    twitter: String,
    facebook: String
  },
  // Company culture and benefits
  culture: {
    values: [String],
    benefits: [String],
    perks: [String],
    workEnvironment: String
  },
  // Company statistics
  stats: {
    totalJobs: {
      type: Number,
      default: 0
    },
    activeJobs: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  // Company verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['business_license', 'tax_certificate', 'incorporation_certificate', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Company admins
  admins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'recruiter'],
      default: 'recruiter'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Company settings
  settings: {
    allowDirectApplications: {
      type: Boolean,
      default: true
    },
    requireResume: {
      type: Boolean,
      default: true
    },
    requireCoverLetter: {
      type: Boolean,
      default: false
    },
    autoReply: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: String
    }
  },
  // Social media presence
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String
  },
  // Company reviews and ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    content: String,
    pros: [String],
    cons: [String],
    workLifeBalance: {
      type: Number,
      min: 1,
      max: 5
    },
    compensation: {
      type: Number,
      min: 1,
      max: 5
    },
    careerGrowth: {
      type: Number,
      min: 1,
      max: 5
    },
    management: {
      type: Number,
      min: 1,
      max: 5
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ size: 1 });
companySchema.index({ 'headquarters.country': 1 });
companySchema.index({ 'headquarters.city': 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ 'stats.averageRating': -1 });

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const { address, city, state, country, zipCode } = this.headquarters;
  const parts = [address, city, state, zipCode, country].filter(Boolean);
  return parts.join(', ');
});

// Virtual for company age
companySchema.virtual('age').get(function() {
  if (!this.founded) return null;
  return new Date().getFullYear() - this.founded;
});

// Method to add admin
companySchema.methods.addAdmin = function(userId, role = 'recruiter') {
  // Check if user is already an admin
  const existingAdmin = this.admins.find(admin => admin.user.toString() === userId.toString());
  if (existingAdmin) {
    throw new Error('User is already an admin of this company');
  }
  
  this.admins.push({
    user: userId,
    role
  });
  
  return this.save();
};

// Method to remove admin
companySchema.methods.removeAdmin = function(userId) {
  this.admins = this.admins.filter(admin => admin.user.toString() !== userId.toString());
  return this.save();
};

// Method to check if user is admin
companySchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.user.toString() === userId.toString());
};

// Method to check if user is owner
companySchema.methods.isOwner = function(userId) {
  return this.admins.some(admin => 
    admin.user.toString() === userId.toString() && admin.role === 'owner'
  );
};

// Method to add review
companySchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  
  // Update average rating
  this.updateAverageRating();
  
  return this.save();
};

// Method to update average rating
companySchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.stats.averageRating = 0;
    this.stats.totalReviews = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.stats.totalReviews = this.reviews.length;
};

// Method to update job statistics
companySchema.methods.updateJobStats = function() {
  return this.constructor.aggregate([
    { $match: { _id: this._id } },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: 'company',
        as: 'jobs'
      }
    },
    {
      $project: {
        totalJobs: { $size: '$jobs' },
        activeJobs: {
          $size: {
            $filter: {
              input: '$jobs',
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      this.stats.totalJobs = result[0].totalJobs;
      this.stats.activeJobs = result[0].activeJobs;
      return this.save();
    }
  });
};

// Static method to search companies
companySchema.statics.searchCompanies = function(query, filters = {}) {
  const searchQuery = { isActive: true };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  if (filters.industry) {
    searchQuery.industry = filters.industry;
  }
  
  if (filters.size) {
    searchQuery.size = filters.size;
  }
  
  if (filters.location) {
    searchQuery.$or = [
      { 'headquarters.city': { $regex: filters.location, $options: 'i' } },
      { 'headquarters.country': { $regex: filters.location, $options: 'i' } }
    ];
  }
  
  if (filters.minRating) {
    searchQuery['stats.averageRating'] = { $gte: filters.minRating };
  }
  
  return this.find(searchQuery)
    .sort({ 'stats.averageRating': -1, createdAt: -1 });
};

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Company', companySchema);
