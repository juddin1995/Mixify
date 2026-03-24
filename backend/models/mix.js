import mongoose from "mongoose";

const mixSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // File paths (stored relative to uploads directory)
    backingTrackFile: {
      type: String,
      required: true,
    },
    backingTrackName: {
      type: String,
      default: "Backing Track",
    },
    recordingFile: {
      type: String,
      required: true,
    },
    mixedAudioFile: {
      type: String,
      required: true,
    },
    // Metadata
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    // Mixing configuration
    backingTrackVolume: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2,
    },
    recordingVolume: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2,
    },
    clientSideMix: {
      type: Boolean,
      default: false, // true = Web Audio API, false = FFmpeg
    },
    // Publishing & Community
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    // Tags and genre for discovery
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    genre: {
      type: String,
      default: "",
      trim: true,
    },
    // Sharing and permissions
    isExportOnly: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// Indexes for queries
mixSchema.index({ userId: 1, createdAt: -1 });
mixSchema.index({ isPublished: 1, createdAt: -1 });
mixSchema.index({ genre: 1 });
mixSchema.index({ tags: 1 });
mixSchema.index({ userId: 1, isPublished: 1 });

// Virtual for computed properties
mixSchema.virtual("isMine").get(function () {
  return this.userId.toString();
});

const Mix = mongoose.model("Mix", mixSchema);

export default Mix;
