import apiClient from '../api/client';

class MixService {
  /**
   * Create a new mix record
   */
  async createMix(mixData) {
    try {
      const response = await apiClient.post('/api/mixes', mixData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create mix');
    }
  }

  /**
   * Get user's mixes
   */
  async getUserMixes(options = {}) {
    try {
      const { limit = 10, skip = 0, published } = options;
      const params = { limit, skip };
      if (published !== undefined) {
        params.published = published;
      }
      const response = await apiClient.get('/api/mixes', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get mixes');
    }
  }

  /**
   * Get single mix by ID
   */
  async getMixById(mixId) {
    try {
      const response = await apiClient.get(`/api/mixes/${mixId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Mix not found');
    }
  }

  /**
   * Update mix metadata
   */
  async updateMix(mixId, updateData) {
    try {
      const response = await apiClient.put(`/api/mixes/${mixId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update mix');
    }
  }

  /**
   * Delete mix
   */
  async deleteMix(mixId) {
    try {
      const response = await apiClient.delete(`/api/mixes/${mixId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete mix');
    }
  }

  /**
   * Publish mix to community
   */
  async publishMix(mixId) {
    try {
      const response = await apiClient.post(`/api/mixes/${mixId}/publish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to publish mix');
    }
  }

  /**
   * Unpublish mix from community
   */
  async unpublishMix(mixId) {
    try {
      const response = await apiClient.post(`/api/mixes/${mixId}/unpublish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to unpublish mix');
    }
  }

  /**
   * Like a mix
   */
  async likeMix(mixId) {
    try {
      const response = await apiClient.post(`/api/mixes/${mixId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to like mix');
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(mixId) {
    try {
      const response = await apiClient.post(`/api/mixes/${mixId}/view`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update view count');
    }
  }
}

const mixService = new MixService();
export default mixService;
