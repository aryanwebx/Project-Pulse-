import axios from 'axios'

export const dashboardService = {
  // Get dashboard stats for current community
  async getDashboardStats(communityId) {
    try {
      const response = await axios.get(`/api/dashboard/stats?communityId=${communityId}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Return mock data for development
      return this.getMockStats()
    }
  },

  // Get recent issues
  async getRecentIssues(communityId, limit = 5) {
    try {
      const response = await axios.get(`/api/issues?communityId=${communityId}&limit=${limit}&sort=-createdAt`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch recent issues:', error)
      return this.getMockRecentIssues()
    }
  },

  // Mock data for development
  getMockStats() {
    return {
      totalIssues: 24,
      openIssues: 12,
      resolvedThisWeek: 8,
      highPriority: 3,
      averageResolutionTime: '2.5 days'
    }
  },

  getMockRecentIssues() {
    return [
      {
        _id: '1',
        title: 'Park maintenance required',
        status: 'open',
        priority: 'high',
        category: 'Maintenance',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        upvotes: 5
      },
      {
        _id: '2',
        title: 'Street light not working',
        status: 'in-progress',
        priority: 'medium',
        category: 'Infrastructure',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 3
      },
      {
        _id: '3',
        title: 'Garbage collection delayed',
        status: 'resolved',
        priority: 'medium',
        category: 'Sanitation',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 8
      }
    ]
  }
}