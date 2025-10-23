const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot be more than 100 characters']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  settings: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    logo: {
      type: String,
      default: ''
    },
    categories: [{
      type: String,
      default: ['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Other']
    }],
    aiFeatures: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      newIssues: {
        type: Boolean,
        default: true
      },
      statusUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
communitySchema.index({ subdomain: 1 });
communitySchema.index({ isActive: 1 });
communitySchema.index({ createdBy: 1 });

// Virtual for member count (will be populated when needed)
communitySchema.virtual('memberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'community',
  count: true
});

// Ensure virtual fields are serialized
communitySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Community', communitySchema);