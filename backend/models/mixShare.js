import mongoose from "mongoose";
import crypto from "crypto";

const mixShareSchema = new mongoose.Schema(
  {
    mixId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mix",
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Share token for unauthenticated access
    shareToken: {
      type: String,
      unique: true,
      index: true,
    },
    // Optional: shared with specific user
    sharedWithUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Permission levels: 'listen-only', 'view-only', 'edit'
    permission: {
      type: String,
      enum: ["listen-only", "view-only", "edit"],
      default: "listen-only",
    },
    // Expiration
    expiresAt: {
      type: Date,
      default: null, // null = no expiration
    },
    // Tracking
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Generate unique share token before saving
mixShareSchema.pre("save", async function (next) {
  if (!this.shareToken) {
    // Generate a unique, URL-safe token
    this.shareToken = crypto.randomBytes(16).toString("hex");
  }
  next();
});

// Check if share is still valid
mixShareSchema.methods.isValid = function () {
  if (this.expiresAt && new Date() > this.expiresAt) {
    return false;
  }
  return true;
};

// Increment access count
mixShareSchema.methods.incrementAccess = async function () {
  this.accessCount += 1;
  return this.save();
};

const MixShare = mongoose.model("MixShare", mixShareSchema);

export default MixShare;
