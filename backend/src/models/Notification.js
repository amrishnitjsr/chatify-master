import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "follow",
                "unfollow",
                "profile_view",
                "message",
                "story_view",
                "post_like",
                "post_comment",
                "post_share"
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            // This can reference different collections based on notification type
            // For messages: Message ID
            // For posts: Post ID
            // For stories: Story ID
        },
        entityType: {
            type: String,
            enum: ["message", "post", "story", "user"],
        },
        metadata: {
            // Additional data specific to notification type
            messageText: String,
            postImage: String,
            storyContent: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;