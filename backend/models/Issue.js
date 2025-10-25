const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Other'],
      message: 'Category must be Plumbing, Electrical, Security, Cleanliness, Parking, or Other'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'acknowledged', 'in_progress', 'resolved'],
      message: 'Status must be open, acknowledged, in_progress, or resolved'
    },
    default: 'open'
  },
  urgency: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Urgency must be low, medium, high, or critical'
    },
    default: 'medium'
  },
  location: {
    type: String,
    default: '',
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  aiAnalysis: {
    predictedCategory: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    isDuplicate: Boolean,
    similarIssues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }],
    summary: String,
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
issueSchema.index({ community: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ urgency: 1 });
issueSchema.index({ createdBy: 1 });
issueSchema.index({ upvoteCount: -1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ community: 1, status: 1 });
issueSchema.index({ community: 1, category: 1 });

// Update upvote count when upvotes array changes
issueSchema.pre('save', function(next) {
  this.upvoteCount = this.upvotes.length;
  next();
});

// Set resolvedAt when status changes to resolved
issueSchema.pre('save', function(next) {
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// Virtual for comments
issueSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue'
});

// Virtual for comments count
issueSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue',
  count: true
});

// Virtual for resolution time (in days)
issueSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.ceil((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are included when converting to JSON
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);