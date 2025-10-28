import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Base64 encoded image/video
      required: true,
    },
    contentType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    text: {
      type: String, // Optional text overlay
      default: "",
    },
    backgroundColor: {
      type: String, // For text-only stories
      default: "#000000",
    },
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from creation
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic deletion of expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
storySchema.index({ userId: 1, isActive: 1, expiresAt: 1 });
storySchema.index({ createdAt: -1 });

const Story = mongoose.model("Story", storySchema);

export default Story;