import axios from 'axios'

export const communityService = {
  // Get all communities (for registration dropdown)
  async getCommunities() {
    try {
      const response = await axios.get('/api/communities')
      // Make sure to return the array of communities correctly
      return response.data.data || { communities: [] }
    } catch (error) {
      console.error("Error in getCommunities:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch communities')
    }
  },

  // Get current community for the logged-in user
  async getUserCommunity() {
    try {
      const response = await axios.get('/api/communities/current')
      // Ensure the nested structure is handled
      return response.data.data // This correctly returns { community: {...}, stats: {...} }
    } catch (error) {
      console.error("Error in getUserCommunity:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user community')
    }
  },

  // Get community stats (Note: getUserCommunity now includes stats)
  // You might not need this function separately anymore if getUserCommunity works
  async getCommunityStats(communityId) {
    try {
      const response = await axios.get(`/api/communities/${communityId}/stats`)
      return response.data.data || response.data
    } catch (error) {
       console.error("Error in getCommunityStats:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch community stats')
    }
  },

  // --- NEW: Admin Functions ---

  /**
   * Fetches the list of members for the current community.
   * @param {object} filters - Optional filters (e.g., { page: 1, limit: 20, role: '', search: '' })
   * @returns {Promise<object>} - The API response data (includes members, pagination)
   */
  async getCommunityMembers(filters = {}) {
    try {
      const params = new URLSearchParams(filters)
      // Tenant context is handled by middleware, no communityId needed here
      const response = await axios.get(`/api/communities/members?${params.toString()}`)
      console.log("getCommunityMembers response:", response.data);
      return response.data.data || { members: [], total: 0 } // Return default structure
    } catch (error) {
      console.error("Error in getCommunityMembers:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch members')
    }
  },

  /**
   * Updates the role of a specific community member.
   * @param {string} userId - The ID of the user to update.
   * @param {string} role - The new role ('resident' or 'community_admin').
   * @returns {Promise<object>} - The updated user object.
   */
  async updateUserRole(userId, role) {
    try {
      const response = await axios.put(`/api/communities/members/${userId}/role`, { role })
      return response.data.data.user || response.data.data // Return updated user
    } catch (error) {
      console.error("Error in updateUserRole:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update user role')
    }
  },

  /**
   * Activates or deactivates a specific community member.
   * @param {string} userId - The ID of the user to update.
   * @param {boolean} isActive - The new status (true for active, false for inactive).
   * @returns {Promise<object>} - The updated user object.
   */
  async updateUserStatus(userId, isActive) {
    try {
      const response = await axios.put(`/api/communities/members/${userId}/status`, { isActive })
      return response.data.data.user || response.data.data // Return updated user
    } catch (error) {
      console.error("Error in updateUserStatus:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update user status')
    }
  },

  // --- NEW Super Admin Functions (but related to communities) ---

  /**
   * Gets ALL communities (for super admin)
   * Hits GET /api/communities (which requires super_admin)
   */
  async getAllCommunities() {
    try {
      const response = await axios.get('/api/communities'); 
      return response.data.data; // { communities: [], ... }
    } catch (error) {
      console.error("Error fetching all communities:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch all communities');
    }
  },

  /**
   * Creates a new community (for super admin)
   * Hits POST /api/communities
   */
  async createCommunity(communityData) {
    try {
      // communityData should be { name, subdomain, contactEmail }
      const response = await axios.post('/api/communities', communityData);
      return response.data.data.community; // Returns the new community
    } catch (error) {
      console.error("Error creating community:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create community');
    }
  }

  
}