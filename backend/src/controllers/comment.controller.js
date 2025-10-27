import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text, parentId } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" });
        }

        if (text.length > 1000) {
            return res.status(400).json({ message: "Comment text too long (max 1000 characters)" });
        }

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // If this is a reply, verify parent comment exists
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent comment not found" });
            }

            // Ensure parent comment belongs to the same post
            if (parentComment.postId.toString() !== postId) {
                return res.status(400).json({ message: "Parent comment doesn't belong to this post" });
            }
        }

        // Create new comment
        const newComment = new Comment({
            userId,
            postId,
            text: text.trim(),
            parentId: parentId || null,
        });

        await newComment.save();

        // Update post's comment count (only for top-level comments)
        if (!parentId) {
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
        }

        // Populate user information for response
        await newComment.populate('userId', 'fullName profilePic');

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get comments for a post (organized hierarchically)
export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Get top-level comments (no parentId)
        const topLevelComments = await Comment.find({
            postId,
            parentId: null
        })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: 1 }) // Oldest first for comments
            .skip(skip)
            .limit(limit)
            .lean();

        // Get all replies for these top-level comments
        const commentIds = topLevelComments.map(comment => comment._id);
        const replies = await Comment.find({
            parentId: { $in: commentIds }
        })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: 1 })
            .lean();

        // Organize replies under their parent comments
        const commentsWithReplies = topLevelComments.map(comment => ({
            ...comment,
            replies: replies.filter(reply =>
                reply.parentId.toString() === comment._id.toString()
            ),
        }));

        const total = await Comment.countDocuments({ postId, parentId: null });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            comments: commentsWithReplies,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments: total,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get replies for a specific comment
export const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Verify comment exists
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const replies = await Comment.find({ parentId: commentId })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Comment.countDocuments({ parentId: commentId });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            replies,
            parentComment: {
                _id: comment._id,
                text: comment.text,
                userId: comment.userId,
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalReplies: total,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching comment replies:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a comment (only by the author)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user is the author
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        const postId = comment.postId;
        const isTopLevel = !comment.parentId;

        // If this comment has replies, delete them too
        await Comment.deleteMany({ parentId: commentId });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Update post's comment count (only for top-level comments)
        if (isTopLevel) {
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });
        }

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a comment (only by the author)
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" });
        }

        if (text.length > 1000) {
            return res.status(400).json({ message: "Comment text too long (max 1000 characters)" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user is the author
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        // Update comment
        comment.text = text.trim();
        await comment.save();

        // Populate user information for response
        await comment.populate('userId', 'fullName profilePic');

        res.status(200).json(comment);
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};