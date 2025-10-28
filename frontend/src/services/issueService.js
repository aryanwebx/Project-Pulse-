import axios from 'axios'

export const issueService = {
  // Get all issues with filtering and pagination
  async getIssues(filters = {}, page = 1, limit = 12) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      console.log('Fetching issues with params:', params.toString())
      const response = await axios.get(`/api/issues?${params.toString()}`)
      console.log('Issues response:', response.data)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch issues:', error.response?.data || error.message)
      return this.getMockIssues()
    }
  },

  // Get a single issue by ID
  async getIssueById(issueId) {
    try {
      const response = await axios.get(`/api/issues/${issueId}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch issue:', error)
      throw error
    }
  },

  // Create a new issue
  async createIssue(issueData) {
    try {
      // If there are images, we need to use FormData
      if (issueData.images && issueData.images.length > 0) {
        const formData = new FormData()
        
        // Append all form fields
        Object.keys(issueData).forEach(key => {
          if (key === 'images') {
            // Append each image file
            issueData.images.forEach(image => {
              formData.append('images', image)
            })
          } else {
            formData.append(key, issueData[key])
          }
        })

        console.log('Uploading issue with images...')
        const response = await axios.post('/api/issues', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data.data || response.data
      } else {
        // No images, send as JSON
        console.log('Creating issue without images...')
        const response = await axios.post('/api/issues', issueData)
        return response.data.data || response.data
      }
    } catch (error) {
      console.error('Failed to create issue:', error.response?.data || error.message)
      throw error
    }
  },

  // Update an issue
  async updateIssue(issueId, updateData) {
    try {
      const response = await axios.patch(`/api/issues/${issueId}`, updateData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to update issue:', error)
      throw error
    }
  },

  // Upvote an issue
  async upvoteIssue(issueId) {
    try {
      const response = await axios.post(`/api/issues/${issueId}/upvote`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to upvote issue:', error)
      throw error
    }
  },

   // Get a single issue by ID with full details
  async getIssueById(issueId) {
    try {
      const response = await axios.get(`/api/issues/${issueId}`)
      console.log('Issue detail response:', response.data)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch issue:', error.response?.data || error.message)
      // Return mock data for development
      return this.getMockIssueDetail(issueId)
    }
  },

  // Add a comment to an issue
  async addComment(issueId, commentData) {
    try {
      const response = await axios.post(`/api/issues/${issueId}/comments`, commentData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  },

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status, adminNotes = '') {
    try {
      const response = await axios.patch(`/api/issues/${issueId}/status`, {
        status,
        adminNotes
      })
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    }
  },

}