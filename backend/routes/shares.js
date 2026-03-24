import express from "express";
import checkToken from "../middleware/checkToken.js";
import ownershipCheck from "../middleware/ownershipCheck.js";
import permissionCheck from "../middleware/permissionCheck.js";
import sharingService from "../services/sharingService.js";

const router = express.Router();

/**
 * @route   POST /api/shares/mixes/:mixId/create
 * @desc    Create a shareable link for a mix
 * @access  Private (owner only)
 */
router.post("/mixes/:mixId/create", checkToken, ownershipCheck, async (req, res) => {
  try {
    const { permission, sharedWithUserId, expiresAt } = req.body;

    const share = await sharingService.createShare(
      req.params.mixId,
      req.user.id,
      {
        permission: permission || "listen-only",
        sharedWithUserId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    );

    res.status(201).json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/shares/mixes/:mixId
 * @desc    Get all shares for a mix (owner only)
 * @access  Private (owner only)
 */
router.get("/mixes/:mixId", checkToken, ownershipCheck, async (req, res) => {
  try {
    const shares = await sharingService.getSharesForMix(
      req.params.mixId,
      req.user.id,
    );
    res.json(shares);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/shares/:token
 * @desc    Get mix by share token (public, but validates link)
 * @access  Public
 */
router.get("/:token", permissionCheck, async (req, res) => {
  try {
    const share = req.share;
    const mix = share.mixId;

    // Return mix data with limited fields based on permission
    const mixData = {
      _id: mix._id,
      title: mix.title,
      description: mix.description,
      backingTrackName: mix.backingTrackName,
      duration: mix.duration,
      genre: mix.genre,
      tags: mix.tags,
      likeCount: mix.likeCount,
      viewCount: mix.viewCount,
      userId: mix.userId,
      publishedAt: mix.publishedAt,
      permission: share.permission,
    };

    // Hide file paths unless permission allows
    if (share.permission === "edit" || share.permission === "view-only") {
      mixData.backingTrackFile = mix.backingTrackFile;
      mixData.recordingFile = mix.recordingFile;
      mixData.mixedAudioFile = mix.mixedAudioFile;
    }

    res.json(mixData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/shares/:shareId
 * @desc    Delete a share link (owner only)
 * @access  Private (owner only)
 */
router.delete("/:shareId", checkToken, async (req, res) => {
  try {
    const result = await sharingService.deleteShare(req.params.shareId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
