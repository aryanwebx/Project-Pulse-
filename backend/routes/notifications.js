const express = require('express');
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const router = express.Router();

// All routes in this file require authentication
router.use(auth);

/**
 * @desc    Get all unread notifications for the logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      isRead: false,
    })
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 unread notifications

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching notifications' });
  }
});

/**
 * @desc    Mark a single notification as read
 * @route   POST /api/notifications/:id/read
 * @access  Private
 */
router.post('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // Ensure user owns this notification
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @desc    Mark all notifications as read for the user
 * @route   POST /api/notifications/read-all
 * @access  Private
 */
router.post('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;