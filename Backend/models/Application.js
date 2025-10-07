const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  status: {
    type: String,
    enum: [
      'pending',      // Application submitted, awaiting review
      'reviewed',     // Application has been reviewed
      'shortlisted',  // Applicant is shortlisted
      'interviewed',  // Interview scheduled/completed
      'offered',      // Job offer made
      'rejected',     // Application rejected
      'withdrawn'     // Application withdrawn by applicant
    ],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot be more than 2000 characters']
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  expectedSalary: {
    type: Number,
    min: [0, 'Expected salary cannot be negative']
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  portfolio: {
    type: String
  },
  linkedin: {
    type: String
  },
  github: {
    type: String
  },
  website: {
    type: String
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional information cannot be more than 1000 characters']
  },
  // Interview details
  interview: {
    scheduledDate: Date,
    interviewType: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'hr']
    },
    location: String,
    notes: String,
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Offer details
  offer: {
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    startDate: Date,
    benefits: [String],
    notes: String,
    offerDate: Date,
    responseDeadline: Date
  },
  // Rejection details
  rejection: {
    reason: String,
    feedback: String,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date
  },
  // Internal notes for recruiters
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Application source tracking
  source: {
    type: String,
    enum: ['website', 'linkedin', 'indeed', 'referral', 'other'],
    default: 'website'
  },
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'message', 'note'],
      required: true
    },
    content: String,
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for time since applied
applicationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMs = now - this.createdAt;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
});

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  
  // Add internal note about status change
  this.internalNotes.push({
    note: `Status changed to ${newStatus}${notes ? ': ' + notes : ''}`,
    addedBy: updatedBy
  });
  
  // Set specific fields based on status
  if (newStatus === 'rejected') {
    this.rejection = {
      rejectedBy: updatedBy,
      rejectedAt: new Date(),
      reason: notes
    };
  } else if (newStatus === 'offered') {
    this.offer = {
      offerDate: new Date(),
      ...this.offer
    };
  }
  
  return this.save();
};

// Method to add communication
applicationSchema.methods.addCommunication = function(type, content, direction, sentBy) {
  this.communications.push({
    type,
    content,
    direction,
    sentBy
  });
  return this.save();
};

// Method to add internal note
applicationSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy
  });
  return this.save();
};

// Static method to get applications by job
applicationSchema.statics.getByJob = function(jobId, status = null) {
  const query = { job: jobId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('applicant', 'name email avatar profile')
    .populate('job', 'title companyName')
    .sort({ createdAt: -1 });
};

// Static method to get applications by applicant
applicationSchema.statics.getByApplicant = function(applicantId, status = null) {
  const query = { applicant: applicantId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('job', 'title companyName location salary type category')
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get application statistics
applicationSchema.statics.getStats = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
