import express from "express";
import Mix from "../models/mix.js";
import User from "../models/user.js";

const router = express.Router();

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile with public info
 * @access  Public
 */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name email createdAt",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user stats
    const totalMixes = await Mix.countDocuments({
      userId: req.params.userId,
      isPublished: true,
    });

    const totalLikes = await Mix.aggregate([
      { $match: { userId: user._id, isPublished: true } },
      { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } },
    ]);

    const totalViews = await Mix.aggregate([
      { $match: { userId: user._id, isPublished: true } },
      { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
    ]);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        mixes: totalMixes,
        likes: totalLikes[0]?.totalLikes || 0,
        views: totalViews[0]?.totalViews || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/:userId/mixes
 * @desc    Get all published mixes by a user
 * @access  Public
 */
router.get("/:userId/mixes", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const total = await Mix.countDocuments({
      userId: req.params.userId,
      isPublished: true,
    });

    const mixes = await Mix.find({
      userId: req.params.userId,
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip)
      .select(
        "title description genre tags likeCount viewCount publishedAt userId",
      );

    res.json({
      mixes,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/trending
 * @desc    Get trending creators
 * @access  Public
 */
router.get("/trending/creators", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Find users with most published mixes and likes
    const trendingUsers = await Mix.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$userId",
          totalMixes: { $sum: 1 },
          totalLikes: { $sum: "$likeCount" },
          totalViews: { $sum: "$viewCount" },
        },
      },
      { $sort: { totalLikes: -1, totalMixes: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          user: { $arrayElemAt: ["$user", 0] },
          totalMixes: 1,
          totalLikes: 1,
          totalViews: 1,
        },
      },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          totalMixes: 1,
          totalLikes: 1,
          totalViews: 1,
        },
      },
    ]);

    res.json(trendingUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
