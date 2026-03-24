import MixShare from "../models/mixShare.js";

/**
 * Validates share token and checks permissions
 * Sets req.share with share data if valid
 */
const permissionCheck = async (req, res, next) => {
  try {
    const { token } = req.params;

    const share = await MixShare.findOne({ shareToken: token }).populate(
      "mixId",
    );

    if (!share) {
      return res.status(404).json({ error: "Share not found or has expired" });
    }

    // Check if share is still valid
    if (!share.isValid()) {
      return res.status(410).json({ error: "Share link has expired" });
    }

    req.share = share;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default permissionCheck;
