import axios from '../config/axios'; // <-- THIS IS THE FIX

export const notificationService = {
  /**
   * Gets unread notifications and the unread count.
   * @returns {Promise<{notifications: Array, unreadCount: number}>}
   */
  async getNotifications() {
    try {
      // This will now correctly call GET /api/notifications
      const response = await axios.get('/api/notifications');
      return response.data.data; // { notifications: [...], unreadCount: 0 }
    } catch (error) {
      console.error('Failed to fetch notifications:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
    }
  },

  /**
   * Marks a single notification as read.
   * @param {string} notificationId
   */
  async markOneAsRead(notificationId) {
    try {
      // This will now correctly call POST /api/notifications/:id/read
      await axios.post(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error.response?.data || error.message);
      // Fail silently, not critical
    }
  },

  /**
   * Marks all of the user's notifications as read.
   */
  async markAllAsRead() {
    try {
      // This will now correctly call POST /api/notifications/read-all
      await axios.post('/api/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read:', error.response?.data || error.message);
      // Fail silently
    }
  },
};