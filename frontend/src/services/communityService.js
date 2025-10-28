import axios from 'axios'

export const communityService = {
  // Get all communities (for registration dropdown)
  async getCommunities() {
    try {
      const response = await axios.get('/api/communities')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch communities')
    }
  },

  // Get communities where user is a member (for switching)
  async getUserCommunities() {
    try {
      const response = await axios.get('/api/communities/user')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user communities')
    }
  },

  // Create new community (super admin only)
  async createCommunity(communityData) {
    try {
      const response = await axios.post('/api/communities', communityData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create community')
    }
  }

}

 await communityService.getCommunities();

