import apiClient from '../api/client';

class SharingService {
  /**
   * Create a share link
   */
  async createShare(mixId, options = {}) {
    try {
      const response = await apiClient.post(
        `/api/shares/mixes/${mixId}/create`,
        options
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create share');
    }
  }

  /**
   * Get all shares for a mix
   */
  async getSharesForMix(mixId) {
    try {
      const response = await apiClient.get(`/api/shares/mixes/${mixId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get shares');
    }
  }

  /**
   * Get mix by share token
   */
  async getByToken(token) {
    try {
      const response = await apiClient.get(`/api/shares/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Share not found');
    }
  }

  /**
   * Delete a share link
   */
  async deleteShare(shareId) {
    try {
      const response = await apiClient.delete(`/api/shares/${shareId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete share');
    }
  }
}

const sharingService = new SharingService();
export default sharingService;
