import Mix from "../models/mix.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../uploads");

class MixService {
  /**
   * Create a new mix record
   */
  async createMix(userId, mixData) {
    try {
      const mix = new Mix({
        userId,
        ...mixData,
      });
      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Failed to create mix: ${error.message}`);
    }
  }

  /**
   * Get mix by ID
   */
  async getMixById(mixId) {
    try {
      const mix = await Mix.findById(mixId).populate("userId", "name email");
      if (!mix) {
        throw new Error("Mix not found");
      }
      return mix;
    } catch (error) {
      throw new Error(`Failed to get mix: ${error.message}`);
    }
  }

  /**
   * Get all mixes for a user with pagination
   */
  async getUserMixes(
    userId,
    { limit = 10, skip = 0, isPublished = null } = {},
  ) {
    try {
      const query = { userId };
      if (isPublished !== null) {
        query.isPublished = isPublished;
      }

      const total = await Mix.countDocuments(query);
      const mixes = await Mix.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "name email");

      return {
        mixes,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to get user mixes: ${error.message}`);
    }
  }

  /**
   * Update mix metadata
   */
  async updateMix(mixId, userId, updateData) {
    try {
      // Verify ownership
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }
      if (mix.userId.toString() !== userId.toString()) {
        throw new Error("Not authorized to update this mix");
      }

      // Only allow updating specific fields
      const allowedFields = [
        "title",
        "description",
        "backingTrackVolume",
        "recordingVolume",
        "tags",
        "genre",
      ];
      const updates = {};
      allowedFields.forEach((field) => {
        if (field in updateData) {
          updates[field] = updateData[field];
        }
      });

      Object.assign(mix, updates);
      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Failed to update mix: ${error.message}`);
    }
  }

  /**
   * Delete mix and clean up files
   */
  async deleteMix(mixId, userId) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }
      if (mix.userId.toString() !== userId.toString()) {
        throw new Error("Not authorized to delete this mix");
      }

      // Delete associated files
      await this.deleteFiles([
        mix.backingTrackFile,
        mix.recordingFile,
        mix.mixedAudioFile,
      ]);

      // Delete from database
      await Mix.findByIdAndDelete(mixId);
      return { success: true, message: "Mix deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete mix: ${error.message}`);
    }
  }

  /**
   * Publish a mix to community
   */
  async publishMix(mixId, userId) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }
      if (mix.userId.toString() !== userId.toString()) {
        throw new Error("Not authorized to publish this mix");
      }

      mix.isPublished = true;
      mix.publishedAt = new Date();
      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Failed to publish mix: ${error.message}`);
    }
  }

  /**
   * Unpublish a mix from community
   */
  async unpublishMix(mixId, userId) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }
      if (mix.userId.toString() !== userId.toString()) {
        throw new Error("Not authorized to unpublish this mix");
      }

      mix.isPublished = false;
      mix.publishedAt = null;
      mix.viewCount = 0; // Reset stats
      mix.likeCount = 0;
      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Failed to unpublish mix: ${error.message}`);
    }
  }

  /**
   * Get published mixes with pagination and filters
   */
  async getPublishedMixes({
    limit = 10,
    skip = 0,
    genre = null,
    tags = null,
  } = {}) {
    try {
      const query = { isPublished: true };
      if (genre) {
        query.genre = genre;
      }
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      const total = await Mix.countDocuments(query);
      const mixes = await Mix.find(query)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "name email");

      return {
        mixes,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to get published mixes: ${error.message}`);
    }
  }

  /**
   * Search published mixes
   */
  async searchMixes(searchTerm) {
    try {
      const mixes = await Mix.find({
        isPublished: true,
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { tags: { $regex: searchTerm, $options: "i" } },
        ],
      })
        .limit(20)
        .populate("userId", "name email");

      return mixes;
    } catch (error) {
      throw new Error(`Failed to search mixes: ${error.message}`);
    }
  }

  /**
   * Like/unlike a mix
   */
  async toggleLike(mixId, userId) {
    try {
      const mix = await Mix.findById(mixId);
      if (!mix) {
        throw new Error("Mix not found");
      }

      // Simple toggle - increment likeCount
      // In a full implementation, you'd track individual likes
      mix.likeCount += 1;
      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Failed to like mix: ${error.message}`);
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(mixId) {
    try {
      const mix = await Mix.findByIdAndUpdate(
        mixId,
        { $inc: { viewCount: 1 } },
        { new: true },
      );
      return mix;
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  /**
   * Delete files from storage
   */
  async deleteFiles(filePaths) {
    try {
      for (const filePath of filePaths) {
        const fullPath = path.join(UPLOADS_DIR, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    } catch (error) {
      console.error("Error deleting files:", error.message);
      // Don't throw - continue even if file deletion fails
    }
  }
}

export default new MixService();
