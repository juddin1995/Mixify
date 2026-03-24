import apiClient from "../api/client";

class ProfileService {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "User not found");
    }
  }

  /**
   * Get user's mixes
   */
  async getUserMixes(userId, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      const response = await apiClient.get(`/api/users/${userId}/mixes`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get user mixes",
      );
    }
  }

  /**
   * Get trending creators
   */
  async getTrendingCreators(limit = 10) {
    try {
      const response = await apiClient.get("/api/users/trending/creators", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get trending creators",
      );
    }
  }
}

const profileService = new ProfileService();
export default profileService;
