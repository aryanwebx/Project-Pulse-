import axios from '../config/axios';

/**
 * Service functions for Super Admin only.
 * These hit the /api/superadmin endpoints.
 */
export const superAdminService = {

  /**
   * Gets platform-wide stats (total users, issues, etc.)
   */
  async getPlatformStats() {
    try {
      const response = await axios.get('/api/superadmin/stats');
      return response.data.data; // { totalIssues, totalUsers, ... }
    } catch (error) {
      console.error("Error fetching platform stats:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform stats');
    }
  },

  /**
   * Gets a list of ALL users on the platform
   */
  /**
   * Gets a list of ALL users on the platform
   * @param {number} [page=1] - The page number to fetch.
   * @param {number} [limit=20] - The number of items per page.
   * @param {object} [filters={}] - Optional filters (e.g., { search: '' })
   * @returns {Promise<object>} - The API response data (includes users, pagination)
   */
  async getAllUsers(page = 1, limit = 20, filters = {}) { // <-- MODIFIED
    try {
      const params = new URLSearchParams({ // <-- MODIFIED
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await axios.get(`/api/superadmin/users?${params.toString()}`);
      // Return the full data object, which includes pagination
      return response.data.data || { users: [], total: 0, totalPages: 1, currentPage: 1 };
    } catch (error) {
      console.error("Error fetching all users:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch all users');
    }
  },
  /**
   * Updates any user's details (role, community, status)
   * @param {string} userId - The ID of the user to update
   * @param {object} data - The data to update (e.g., { role, community, isActive })
   */
  async updateUser(userId, data) {
    try {
      const response = await axios.put(`/api/superadmin/users/${userId}`, data);
      return response.data.data.user; // Returns the updated user
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }
};