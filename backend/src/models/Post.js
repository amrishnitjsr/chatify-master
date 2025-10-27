import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        imageUrl: {
            type: String,
            default: null,
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        commentCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// Index for better query performance
postSchema.index({ createdAt: -1 }); // Sort posts by newest first
postSchema.index({ userId: 1 }); // Query posts by user
postSchema.index({ 'likes': 1 }); // Query liked posts

const Post = mongoose.model("Post", postSchema);

export default Post;