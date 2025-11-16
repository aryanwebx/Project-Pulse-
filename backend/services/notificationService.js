const Notification = require('../models/Notification');
const { getIO } = require('../socket'); // Import the getIO function

/**
 * Creates and saves a notification, then emits it via socket.
 *
 * @param {string} userId - The ID of the user to notify.
 * @param {string} communityId - The ID of the community.
 * @param {string} type - Notification type (e.g., 'NEW_COMMENT').
 * @param {string} message - The notification text.
 * @param {string} link - The URL to navigate to.
 * @param {string} [createdBy] - (Optional) The user ID that triggered the event.
 */
const createNotification = async (userId, communityId, type, message, link, createdBy = null) => {
  try {
    // 1. Create the notification in the database
    const notification = new Notification({
      user: userId,
      community: communityId,
      type,
      message,
      link,
      createdBy,
    });
    await notification.save();

    // 2. Get the populated notification to send to the client
    const populatedNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'name avatar');
      
    // 3. Emit the notification via socket to the specific user's room
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', populatedNotification);
    
    console.log(`🔔 Notification sent to user: ${userId}`);

  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = {
  createNotification,
};