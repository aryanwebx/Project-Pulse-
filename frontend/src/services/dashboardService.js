import axios from "../config/axios";

export const dashboardService = {
  // Get dashboard stats for current community
  async getDashboardStats(communityId) {
    try {
      // The tenant middleware (identifyTenant) automatically
      // scopes this request to the user's community.
      const response = await axios.get("/api/issues/stats/overview");
      return response.data.data; // Returns { overview: {...}, categories: [...], sentiments: [...] }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to fetch dashboard stats");
    }
  },

  // Get recent issues
  async getRecentIssues(communityId, limit = 5) {
    try {
      // Tenant middleware scopes this request automatically
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const response = await axios.get(`/api/issues?${params.toString()}`);
      return response.data.data; // Returns { issues: [...], total: ... }
    } catch (error) {
      console.error("Failed to fetch recent issues:", error.response?.data || error.message);
      return { issues: [], total: 0 }; // Return default empty state
    }
  },
};
