const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  isAdminUpdate: {
    type: Boolean,
    default: false
  },
  statusUpdate: {
    oldStatus: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved']
    },
    newStatus: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved']
    }
  },
  isInternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ issue: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ community: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ issue: 1, createdAt: 1 });

// Pre-save middleware to ensure community is set from issue
commentSchema.pre('save', async function(next) {
  if (this.isModified('issue') || !this.community) {
    try {
      const Issue = mongoose.model('Issue');
      const issue = await Issue.findById(this.issue).select('community');
      if (issue) {
        this.community = issue.community;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);