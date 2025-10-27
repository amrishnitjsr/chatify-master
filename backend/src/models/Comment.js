import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null, // null for top-level comments, commentId for replies
        },
        replyCount: {
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

// Virtual to check if this is a reply
commentSchema.virtual('isReply').get(function () {
    return this.parentId !== null;
});

// Index for better query performance
commentSchema.index({ postId: 1, createdAt: 1 }); // Get comments for a post
commentSchema.index({ parentId: 1, createdAt: 1 }); // Get replies for a comment
commentSchema.index({ userId: 1 }); // Query comments by user

// Pre-save middleware to update parent comment's reply count
commentSchema.pre('save', async function (next) {
    if (this.isNew && this.parentId) {
        // This is a new reply, increment parent's reply count
        await mongoose.model('Comment').findByIdAndUpdate(
            this.parentId,
            { $inc: { replyCount: 1 } }
        );
    }
    next();
});

// Post-remove middleware to update parent comment's reply count
commentSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.parentId) {
        // This reply was deleted, decrement parent's reply count
        await mongoose.model('Comment').findByIdAndUpdate(
            doc.parentId,
            { $inc: { replyCount: -1 } }
        );
    }
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;