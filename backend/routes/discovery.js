import express from "express";
import mixService from "../services/mixService.js";

const router = express.Router();

/**
 * @route   GET /api/published-mixes
 * @desc    Get published mixes with pagination and filters
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const genre = req.query.genre || null;
    const tagsStr = req.query.tags;
    const tags = tagsStr ? tagsStr.split(",") : null;

    const result = await mixService.getPublishedMixes({
      limit,
      skip,
      genre,
      tags,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/published-mixes/search
 * @desc    Search published mixes by title, description, or tags
 * @access  Public
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: "Search term must be at least 2 characters" });
    }

    const mixes = await mixService.searchMixes(q);
    res.json(mixes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
