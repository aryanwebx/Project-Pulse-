import axios from 'axios'

export const communityService = {
  // Get all communities (for registration dropdown)
  async getCommunities() {
    try {
      const response = await axios.get('/api/communities')
      return response.data.data || response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch communities')
    }
  },

  // Get communities where user is a member
  async getUserCommunity() {
    try {
      const response = await axios.get('/api/communities/current')
      
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user communities')
    }
  },


  // Get community stats
  async getCommunityStats(communityId) {
    try {
      const response = await axios.get(`/api/communities/${communityId}/stats`)
      return response.data.data || response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch community stats')
    }
  }
}

 await communityService.getCommunities();

