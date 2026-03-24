import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Mix from "../models/mix.js";
import MixShare from "../models/mixShare.js";
import mixService from "../services/mixService.js";
import sharingService from "../services/sharingService.js";

// Load environment variables
dotenv.config();

// Test data
let testUserId;
let testMixId;
let testShareId;
let testToken;

describe("Phase 2 - Backend Core APIs", () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/mixify-test";
    const testUri = mongoUri.includes("?") 
      ? mongoUri.replace("?", "-phase2?") 
      : mongoUri + "-phase2";
    
    await mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to test database");

    // Create a test user
    const user = new User({
      name: "Test User Phase 2",
      email: "phase2@example.com",
      password: "password123",
    });
    await user.save();
    testUserId = user._id;

    // Create a test mix
    const mix = await mixService.createMix(testUserId, {
      title: "Test Mix for Phase 2",
      description: "Testing sharing features",
      backingTrackFile: "backing.mp3",
      recordingFile: "recording.wav",
      mixedAudioFile: "mixed.mp3",
    });
    testMixId = mix._id;

    // Publish the mix
    await mixService.publishMix(testMixId, testUserId);
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await Mix.deleteMany({});
    await MixShare.deleteMany({});
    await mongoose.connection.close();
    console.log("✅ Test database cleaned up");
  });

  describe("Sharing Service", () => {
    it("should create a share link for a mix", async () => {
      const share = await sharingService.createShare(testMixId, testUserId, {
        permission: "listen-only",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      assert(share._id);
      assert.strictEqual(share.permission, "listen-only");
      assert.strictEqual(share.ownerId.toString(), testUserId.toString());
      assert(share.shareToken);

      testShareId = share._id;
      testToken = share.shareToken;
    });

    it("should retrieve share by token", async () => {
      const share = await sharingService.getShareByToken(testToken);

      assert(share);
      assert.strictEqual(share.shareToken, testToken);
      assert.strictEqual(share.ownerId.toString(), testUserId.toString());
    });

    it("should increment access count on retrieval", async () => {
      const initialShare = await MixShare.findOne({ shareToken: testToken });
      const initialCount = initialShare.accessCount;

      await sharingService.getShareByToken(testToken);

      const updatedShare = await MixShare.findOne({ shareToken: testToken });
      assert.strictEqual(updatedShare.accessCount, initialCount + 1);
    });

    it("should get all shares for a mix (owner only)", async () => {
      const shares = await sharingService.getSharesForMix(testMixId, testUserId);

      assert(Array.isArray(shares));
      assert(shares.length > 0);
      assert.strictEqual(shares[0].mixId._id.toString(), testMixId.toString());
    });

    it("should throw error if not owner getting shares", async () => {
      try {
        const otherId = new mongoose.Types.ObjectId();
        await sharingService.getSharesForMix(testMixId, otherId);
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Not authorized"));
      }
    });

    it("should delete a share link", async () => {
      const result = await sharingService.deleteShare(testShareId, testUserId);

      assert.strictEqual(result.success, true);

      // Verify it's deleted
      const share = await MixShare.findById(testShareId);
      assert.strictEqual(share, null);
    });

    it("should throw error on expired share", async () => {
      // Create a share that expires immediately
      const expiredShare = new MixShare({
        mixId: testMixId,
        ownerId: testUserId,
        permission: "listen-only",
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      await expiredShare.save();

      try {
        await sharingService.getShareByToken(expiredShare.shareToken);
        assert.fail("Should have thrown error for expired share");
      } catch (error) {
        assert(error.message.includes("expired"));
      }
    });
  });

  describe("Sharing Permissions", () => {
    it("should validate listen-only permission", async () => {
      const share = await sharingService.createShare(testMixId, testUserId, {
        permission: "listen-only",
      });

      const isValid = await sharingService.checkPermission(
        share.shareToken,
        "listen-only",
      );
      assert.strictEqual(isValid, true);
    });

    it("should deny higher permission for lower access", async () => {
      const share = await sharingService.createShare(testMixId, testUserId, {
        permission: "listen-only",
      });

      try {
        await sharingService.checkPermission(share.shareToken, "edit");
        assert.fail("Should have thrown permission error");
      } catch (error) {
        assert(error.message.includes("Insufficient permissions"));
      }
    });
  });

  describe("Published Mixes Discovery", () => {
    it("should retrieve published mixes", async () => {
      const result = await mixService.getPublishedMixes({
        limit: 10,
        skip: 0,
      });

      assert(Array.isArray(result.mixes));
      assert(result.mixes.length > 0);
      assert(result.total > 0);
      assert.strictEqual(result.mixes[0].isPublished, true);
    });

    it("should search published mixes by title", async () => {
      const mixes = await mixService.searchMixes("Test Mix");

      assert(Array.isArray(mixes));
      assert(mixes.length > 0);
      assert(mixes[0].title.includes("Test Mix"));
    });

    it("should filter by genre", async () => {
      // Create a mix with genre
      const mixWithGenre = await mixService.createMix(testUserId, {
        title: "Jazz Mix",
        genre: "Jazz",
        backingTrackFile: "jazz.mp3",
        recordingFile: "recording.wav",
        mixedAudioFile: "mixed.mp3",
      });

      await mixService.publishMix(mixWithGenre._id, testUserId);

      const result = await mixService.getPublishedMixes({
        genre: "Jazz",
      });

      assert(result.mixes.length > 0);
      assert.strictEqual(result.mixes[0].genre, "Jazz");
    });
  });

  describe("Mix Interactions", () => {
    it("should increment view count", async () => {
      const initialMix = await mixService.getMixById(testMixId);
      const initialViews = initialMix.viewCount;

      const updatedMix = await mixService.incrementViewCount(testMixId);

      assert.strictEqual(updatedMix.viewCount, initialViews + 1);
    });

    it("should toggle like on a mix", async () => {
      const initialMix = await mixService.getMixById(testMixId);
      const initialLikes = initialMix.likeCount;

      const updatedMix = await mixService.toggleLike(testMixId, testUserId);

      assert.strictEqual(updatedMix.likeCount, initialLikes + 1);
    });

    it("should maintain like count across users", async () => {
      const mix1 = await mixService.toggleLike(testMixId, testUserId);
      const likes1 = mix1.likeCount;

      const otherId = new mongoose.Types.ObjectId();
      const mix2 = await mixService.toggleLike(testMixId, otherId);
      const likes2 = mix2.likeCount;

      assert.strictEqual(likes2, likes1 + 1);
    });
  });
});
