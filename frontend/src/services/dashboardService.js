import axios from '../config/axios';

export const dashboardService = {
  // Get dashboard stats for current community
  async getDashboardStats(communityId) {
    try {
      // The tenant middleware (identifyTenant) automatically
      // scopes this request to the user's community.
      const response = await axios.get('/api/issues/stats/overview')
      return response.data.data // Returns { overview: {...}, categories: [...], sentiments: [...] }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error.response?.data || error.message)
      // Return a default empty state on error
      return { overview: {}, categories: [], sentiments: [] }
    }
  },

  // Get recent issues
  async getRecentIssues(communityId, limit = 5) {
   try {
      // Tenant middleware scopes this request automatically
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const response = await axios.get(`/api/issues?${params.toString()}`)
      return response.data.data // Returns { issues: [...], total: ... }
    } catch (error) {
      console.error('Failed to fetch recent issues:', error.response?.data || error.message)
      return { issues: [], total: 0 } // Return default empty state
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