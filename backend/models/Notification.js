const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user who receives this notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who triggered the notification (optional)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // The community this notification belongs to
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  // Type of notification
  type: {
    type: String,
    enum: [
      'STATUS_UPDATE',
      'NEW_COMMENT',
      'ASSIGNED_TO_YOU',
      'NEW_ISSUE_IN_COMMUNITY',
    ],
    required: true,
  },
  // The notification message
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  // Link to navigate to on click
  link: {
    type: String,
    required: true,
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient querying of a user's unread notifications
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ community: 1 });

module.exports = mongoose.model('Notification', notificationSchema);