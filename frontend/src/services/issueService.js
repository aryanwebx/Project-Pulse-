import axios from '../config/axios';

export const issueService = {
  // Get all issues with filtering and pagination
  async getIssues(filters = {}, page = 1, limit = 12) {
    try {
      // *** START FIX ***
      // Copy filters to avoid modifying the original object
      const filterParams = { ...filters };
      
      // Check if the sort filter exists
      if (filterParams.sort) {
        let sortBy = filterParams.sort;
        let sortOrder = 'desc'; // Default sortOrder

        // Check if the sort value starts with '-', indicating descending
        if (sortBy.startsWith('-')) {
          sortOrder = 'desc';
          sortBy = sortBy.substring(1); // Remove the '-'
        } else {
          sortOrder = 'asc';
        }

        // Add the new keys that the backend expects
        filterParams.sortBy = sortBy;
        filterParams.sortOrder = sortOrder;
        
        // Delete the old 'sort' key so it doesn't get sent
        delete filterParams.sort;
      }
      // *** END FIX ***

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filterParams // Use the modified filterParams
      })

      console.log('Fetching issues with params:', params.toString())
      const response = await axios.get(`/api/issues?${params.toString()}`)
      console.log('Issues response:', response.data)
      
      // Use the correct pagination data from the response
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch issues:', error.response?.data || error.message)
      // Fallback to mock data or empty array on error
      return { issues: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  // Create a new issue
  async createIssue(issueData) {
    try {
      // If there are images, we need to use FormData
      if (issueData.images && issueData.images.length > 0) {
        const formData = new FormData()
        
        Object.keys(issueData).forEach(key => {
          if (key === 'images') {
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
        return response.data.data.issue || response.data.data
      } else {
        // No images, send as JSON
        console.log('Creating issue without images...')
        const response = await axios.post('/api/issues', issueData)
        return response.data.data.issue || response.data.data
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
      return response.data.data.issue || response.data.data
    } catch (error) {
      console.error('Failed to update issue:', error)
      throw error
    }
  },

  // Upvote an issue
  async upvoteIssue(issueId) {
    try {
      const response = await axios.post(`/api/issues/${issueId}/upvote`)
      // This one already returns { issue: {...} }
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
      
      // Return the issue object directly
      return response.data.data.issue || response.data.issue
      
    } catch (error) {
      console.error('Failed to fetch issue:', error.response?.data || error.message)
      // Return null or throw error so the page can show an error
      throw new Error(error.response?.data?.error || 'Failed to fetch issue');
    }
  },

  // Add a comment to an issue
  async addComment(issueId, commentData) {
    try {
      const response = await axios.post(`/api/issues/${issueId}/comments`, commentData)
      return response.data.data.comment || response.data.data // Return unwrapped comment
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  },

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status, adminNotes = '') {
    try {
      const response = await axios.put(`/api/issues/${issueId}/status`, {
        status,
        adminNotes
      })
      // Return the unwrapped, updated issue object
      return response.data.data.issue || response.data.data
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    }
  },

  // *** NEW FUNCTION ***
  /**
   * Generates an AI-suggested reply for an issue. (Admin only)
   * @param {string} issueId - The ID of the issue
   * @returns {Promise<{suggestedReply: string}>} - The AI-generated reply
   */
  async getAiReply(issueId) {
    try {
      const response = await axios.post(`/api/issues/${issueId}/ai-reply`);
      return response.data.data; // Returns { suggestedReply: "..." }
    } catch (error) {
      console.error('Failed to generate AI reply:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get AI reply');
    }
  },
};


