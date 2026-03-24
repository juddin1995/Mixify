import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Mix from "../models/mix.js";
import mixService from "../services/mixService.js";

// Load environment variables
dotenv.config();

// Mock user and mix data
let testUserId;
let testMixId;

describe("MixService", () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/mixify-test";
    const testUri = mongoUri.includes("?") 
      ? mongoUri.replace("?", "-test?") 
      : mongoUri + "-test";
    
    await mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000 });
    console.log("✅ Connected to test database:", testUri);

    // Create a test user
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    await user.save();
    testUserId = user._id;
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await Mix.deleteMany({});
    await mongoose.connection.close();
    console.log("Test database cleaned up");
  });

  describe("createMix", () => {
    it("should create a new mix with valid data", async () => {
      const mixData = {
        title: "Test Mix",
        description: "A test mix",
        backingTrackFile: "backing.mp3",
        recordingFile: "recording.wav",
        mixedAudioFile: "mixed.mp3",
        backingTrackVolume: 1.0,
        recordingVolume: 1.0,
      };

      const mix = await mixService.createMix(testUserId, mixData);

      assert.strictEqual(mix.title, "Test Mix");
      assert.strictEqual(mix.userId.toString(), testUserId.toString());
      assert.strictEqual(mix.isPublished, false);
      assert.strictEqual(mix.viewCount, 0);

      testMixId = mix._id;
    });

    it("should throw error without required fields", async () => {
      try {
        await mixService.createMix(testUserId, { title: "Incomplete Mix" });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Failed to create mix"));
      }
    });
  });

  describe("getMixById", () => {
    it("should retrieve mix by ID", async () => {
      const mix = await mixService.getMixById(testMixId);

      assert.strictEqual(mix._id.toString(), testMixId.toString());
      assert.strictEqual(mix.title, "Test Mix");
    });

    it("should throw error for non-existent mix", async () => {
      try {
        const fakeId = new mongoose.Types.ObjectId();
        await mixService.getMixById(fakeId);
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Mix not found"));
      }
    });
  });

  describe("getUserMixes", () => {
    it("should retrieve user mixes with pagination", async () => {
      const result = await mixService.getUserMixes(testUserId, {
        limit: 10,
        skip: 0,
      });

      assert(Array.isArray(result.mixes));
      assert.strictEqual(result.mixes.length, 1);
      assert.strictEqual(result.total, 1);
      assert.strictEqual(result.page, 1);
    });

    it("should filter mixes by published status", async () => {
      const result = await mixService.getUserMixes(testUserId, {
        isPublished: false,
      });

      assert.strictEqual(result.mixes.length, 1);
      assert.strictEqual(result.mixes[0].isPublished, false);
    });
  });

  describe("updateMix", () => {
    it("should update mix metadata", async () => {
      const updates = {
        title: "Updated Title",
        description: "Updated description",
        tags: ["tag1", "tag2"],
      };

      const mix = await mixService.updateMix(testMixId, testUserId, updates);

      assert.strictEqual(mix.title, "Updated Title");
      assert.strictEqual(mix.description, "Updated description");
      assert.deepStrictEqual(mix.tags, ["tag1", "tag2"]);
    });

    it("should throw error if not owner", async () => {
      try {
        const anotherUserId = new mongoose.Types.ObjectId();
        await mixService.updateMix(testMixId, anotherUserId, {
          title: "Hacked",
        });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Not authorized"));
      }
    });
  });

  describe("publishMix", () => {
    it("should publish mix to community", async () => {
      const mix = await mixService.publishMix(testMixId, testUserId);

      assert.strictEqual(mix.isPublished, true);
      assert(mix.publishedAt !== null);
    });

    it("should throw error if not owner", async () => {
      try {
        const anotherUserId = new mongoose.Types.ObjectId();
        await mixService.publishMix(testMixId, anotherUserId);
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Not authorized"));
      }
    });
  });

  describe("getPublishedMixes", () => {
    it("should retrieve published mixes", async () => {
      const result = await mixService.getPublishedMixes({ limit: 10, skip: 0 });

      assert(Array.isArray(result.mixes));
      assert.strictEqual(result.mixes.length, 1);
      assert.strictEqual(result.mixes[0].isPublished, true);
    });
  });

  describe("unpublishMix", () => {
    it("should unpublish mix from community", async () => {
      const mix = await mixService.unpublishMix(testMixId, testUserId);

      assert.strictEqual(mix.isPublished, false);
      assert.strictEqual(mix.publishedAt, null);
      assert.strictEqual(mix.viewCount, 0);
    });
  });

  describe("incrementViewCount", () => {
    it("should increment view count", async () => {
      const mix = await mixService.incrementViewCount(testMixId);
      assert.strictEqual(mix.viewCount, 1);

      const mix2 = await mixService.incrementViewCount(testMixId);
      assert.strictEqual(mix2.viewCount, 2);
    });
  });

  describe("toggleLike", () => {
    it("should increment like count", async () => {
      const initialMix = await mixService.getMixById(testMixId);
      const initialLikes = initialMix.likeCount;

      const mix = await mixService.toggleLike(testMixId, testUserId);
      assert.strictEqual(mix.likeCount, initialLikes + 1);
    });
  });
});
