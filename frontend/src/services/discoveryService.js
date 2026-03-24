import apiClient from "../api/client";

class DiscoveryService {
  /**
   * Get published mixes with filters
   */
  async getPublishedMixes(options = {}) {
    try {
      const { limit = 10, skip = 0, genre, tags } = options;
      const params = { limit, skip };
      if (genre) params.genre = genre;
      if (tags) params.tags = tags.join(",");

      const response = await apiClient.get("/api/published-mixes", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get published mixes",
      );
    }
  }

  /**
   * Search published mixes
   */
  async searchMixes(query) {
    try {
      const response = await apiClient.get("/api/published-mixes/search", {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Search failed");
    }
  }
}

const discoveryService = new DiscoveryService();
export default discoveryService;
