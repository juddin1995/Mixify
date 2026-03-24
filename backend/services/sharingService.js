import MixShare from "../models/mixShare.js";
import Mix from "../models/mix.js";

class SharingService {
  /**
   * Create a share link for a mix
   */
  async createShare(mixId, ownerId, options = {}) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }

      if (mix.userId.toString() !== ownerId.toString()) {
        throw new Error("Not authorized to share this mix");
      }

      const share = new MixShare({
        mixId,
        ownerId,
        permission: options.permission || "listen-only",
        sharedWithUserId: options.sharedWithUserId || null,
        expiresAt: options.expiresAt || null,
      });

      await share.save();
      return share;
    } catch (error) {
      throw new Error(`Failed to create share: ${error.message}`);
    }
  }

  /**
   * Get share by token
   */
  async getShareByToken(token) {
    try {
      const share = await MixShare.findOne({ shareToken: token }).populate(
        "mixId",
      );

      if (!share) {
        throw new Error("Share not found");
      }

      if (!share.isValid()) {
        throw new Error("Share has expired");
      }

      // Increment access count
      await share.incrementAccess();

      return share;
    } catch (error) {
      throw new Error(`Failed to get share: ${error.message}`);
    }
  }

  /**
   * Get all shares for a mix (owner only)
   */
  async getSharesForMix(mixId, ownerId) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }

      if (mix.userId.toString() !== ownerId.toString()) {
        throw new Error("Not authorized to view shares for this mix");
      }

      const shares = await MixShare.find({ mixId })
        .populate("sharedWithUserId", "name email")
        .sort({ createdAt: -1 });

      return shares;
    } catch (error) {
      throw new Error(`Failed to get shares: ${error.message}`);
    }
  }

  /**
   * Delete a share link
   */
  async deleteShare(shareId, ownerId) {
    try {
      const share = await MixShare.findById(shareId);
      if (!share) {
        throw new Error("Share not found");
      }

      if (share.ownerId.toString() !== ownerId.toString()) {
        throw new Error("Not authorized to delete this share");
      }

      await MixShare.findByIdAndDelete(shareId);
      return { success: true, message: "Share deleted" };
    } catch (error) {
      throw new Error(`Failed to delete share: ${error.message}`);
    }
  }

  /**
   * Check permission for a share
   */
  async checkPermission(token, requiredPermission) {
    try {
      const share = await MixShare.findOne({ shareToken: token });

      if (!share) {
        throw new Error("Share not found");
      }

      if (!share.isValid()) {
        throw new Error("Share has expired");
      }

      const permissions = ["listen-only", "view-only", "edit"];
      const requiredLevel = permissions.indexOf(requiredPermission);
      const shareLevel = permissions.indexOf(share.permission);

      if (shareLevel < requiredLevel) {
        throw new Error("Insufficient permissions");
      }

      return true;
    } catch (error) {
      throw new Error(`Permission check failed: ${error.message}`);
    }
  }
}

export default new SharingService();
