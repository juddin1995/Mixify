import Mix from "../models/mix.js";

const ownershipCheck = async (req, res, next) => {
  try {
    const { mixId } = req.params;
    const userId = req.user.id;

    const mix = await Mix.findById(mixId);
    if (!mix) {
      return res.status(404).json({ error: "Mix not found" });
    }

    if (mix.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this mix" });
    }

    req.mix = mix;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default ownershipCheck;
