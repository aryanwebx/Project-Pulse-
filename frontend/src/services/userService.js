import axios from '../config/axios';

export const userService = {
  /**
   * Updates the user's profile information.
   * @param {object} userData - { name, apartmentNumber, phone }
   * @returns {Promise<object>} - The updated user object
   */
  async updateProfile(userData) {
    try {
      // This route already exists on your backend
      const response = await axios.put('api/auth/profile', userData);
      return response.data.data.user; // return the updated user
    } catch (error) {
      console.error('Failed to update profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  /**
   * Changes the user's password.
   * @param {object} passwordData - { currentPassword, newPassword }
   * @returns {Promise<object>} - The success response
   */
  async changePassword(passwordData) {
    try {
      // This route also exists on your backend
      const response = await axios.put('api/auth/change-password', passwordData);
      return response.data; // returns { success: true, message: '...' }
    } catch (error) {
      console.error('Failed to change password:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  },
};