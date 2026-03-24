import express from "express";
import checkToken from "../middleware/checkToken.js";
import ownershipCheck from "../middleware/ownershipCheck.js";
import mixService from "../services/mixService.js";

const router = express.Router();

/**
 * @route   POST /api/mixes
 * @desc    Create a new mix record
 * @access  Private
 */
router.post("/", checkToken, async (req, res) => {
  try {
    const {
      title,
      backingTrackFile,
      recordingFile,
      mixedAudioFile,
      ...otherData
    } = req.body;

    // Validate required fields
    if (!title || !backingTrackFile || !recordingFile || !mixedAudioFile) {
      return res.status(400).json({
        error:
          "Missing required fields: title, backingTrackFile, recordingFile, mixedAudioFile",
      });
    }

    const mix = await mixService.createMix(req.user.id, {
      title,
      backingTrackFile,
      recordingFile,
      mixedAudioFile,
      ...otherData,
    });

    res.status(201).json(mix);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/mixes
 * @desc    Get all mixes for authenticated user
 * @access  Private
 */
router.get("/", checkToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const isPublished =
      req.query.published === "true"
        ? true
        : req.query.published === "false"
          ? false
          : null;

    const result = await mixService.getUserMixes(req.user.id, {
      limit,
      skip,
      isPublished,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/mixes/:mixId
 * @desc    Get single mix by ID
 * @access  Private
 */
router.get("/:mixId", checkToken, async (req, res) => {
  try {
    const mix = await mixService.getMixById(req.params.mixId);
    res.json(mix);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/mixes/:mixId
 * @desc    Update mix metadata
 * @access  Private (owner only)
 */
router.put("/:mixId", checkToken, ownershipCheck, async (req, res) => {
  try {
    const mix = await mixService.updateMix(
      req.params.mixId,
      req.user.id,
      req.body,
    );
    res.json(mix);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/mixes/:mixId
 * @desc    Delete mix and clean up files
 * @access  Private (owner only)
 */
router.delete("/:mixId", checkToken, ownershipCheck, async (req, res) => {
  try {
    const result = await mixService.deleteMix(req.params.mixId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/mixes/:mixId/publish
 * @desc    Publish mix to community
 * @access  Private (owner only)
 */
router.post("/:mixId/publish", checkToken, ownershipCheck, async (req, res) => {
  try {
    const mix = await mixService.publishMix(req.params.mixId, req.user.id);
    res.json(mix);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/mixes/:mixId/unpublish
 * @desc    Unpublish mix from community
 * @access  Private (owner only)
 */
router.post(
  "/:mixId/unpublish",
  checkToken,
  ownershipCheck,
  async (req, res) => {
    try {
      const mix = await mixService.unpublishMix(req.params.mixId, req.user.id);
      res.json(mix);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @route   POST /api/mixes/:mixId/like
 * @desc    Like/unlike a mix
 * @access  Private
 */
router.post("/:mixId/like", checkToken, async (req, res) => {
  try {
    const mix = await mixService.toggleLike(req.params.mixId, req.user.id);
    res.json(mix);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/mixes/:mixId/view
 * @desc    Increment view count for a mix
 * @access  Public
 */
router.post("/:mixId/view", async (req, res) => {
  try {
    const mix = await mixService.incrementViewCount(req.params.mixId);
    res.json(mix);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
