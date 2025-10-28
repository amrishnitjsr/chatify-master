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

        // Post's comment count is now handled by the Comment model middleware
        // which counts all comments and replies

        // Populate user information for response
        await newComment.populate('userId', 'fullName profilePic');

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Helper function to recursively build comment tree
const buildCommentTree = (comments, parentId = null) => {
    const children = comments.filter(comment =>
        (comment.parentId === null && parentId === null) ||
        (comment.parentId && comment.parentId.toString() === parentId)
    );

    return children.map(comment => ({
        ...comment,
        replies: buildCommentTree(comments, comment._id.toString()),
    }));
};

// Get comments for a post (organized hierarchically with unlimited nesting)
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

        // Get top-level comments for pagination
        const topLevelComments = await Comment.find({
            postId,
            parentId: null
        })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .select('_id')
            .lean();

        const topLevelIds = topLevelComments.map(c => c._id);

        // Get all comments and replies for these top-level comments
        const allComments = await Comment.find({
            $or: [
                { _id: { $in: topLevelIds } }, // Top-level comments
                { postId, parentId: { $ne: null } } // All replies in the post
            ]
        })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: 1 })
            .lean();

        // Filter to only include replies that belong to our paginated top-level comments
        const relevantComments = allComments.filter(comment => {
            if (comment.parentId === null) {
                return topLevelIds.some(id => id.toString() === comment._id.toString());
            }

            // For replies, check if they ultimately belong to one of our top-level comments
            let current = comment;
            while (current.parentId) {
                current = allComments.find(c => c._id.toString() === current.parentId.toString());
                if (!current) break;
            }
            return current && topLevelIds.some(id => id.toString() === current._id.toString());
        });

        // Build hierarchical structure
        const commentsWithReplies = buildCommentTree(relevantComments);

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

// Get replies for a specific comment with unlimited nesting
export const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Verify comment exists
        const comment = await Comment.findById(commentId)
            .populate('userId', 'fullName profilePic');
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Get direct replies for pagination
        const directReplies = await Comment.find({ parentId: commentId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .select('_id')
            .lean();

        const directReplyIds = directReplies.map(r => r._id);

        // Get all nested replies for the direct replies
        const getAllNestedReplies = async (parentIds) => {
            const replies = await Comment.find({ parentId: { $in: parentIds } })
                .populate('userId', 'fullName profilePic')
                .sort({ createdAt: 1 })
                .lean();

            if (replies.length === 0) return replies;

            const nestedReplies = await getAllNestedReplies(replies.map(r => r._id));
            return [...replies, ...nestedReplies];
        };

        // Get the direct replies with full data
        const directRepliesWithData = await Comment.find({ _id: { $in: directReplyIds } })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: 1 })
            .lean();

        // Get all nested replies
        const nestedReplies = await getAllNestedReplies(directReplyIds);

        // Combine all replies
        const allReplies = [...directRepliesWithData, ...nestedReplies];

        // Build hierarchical structure
        const repliesWithNesting = buildCommentTree(allReplies, commentId);

        const total = await Comment.countDocuments({ parentId: commentId });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            replies: repliesWithNesting,
            parentComment: {
                _id: comment._id,
                text: comment.text,
                userId: comment.userId,
                replyCount: comment.replyCount,
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

// Helper function to recursively delete all nested replies
const deleteCommentRecursively = async (commentId) => {
    // Get all direct children
    const children = await Comment.find({ parentId: commentId });

    // Recursively delete children's children
    for (const child of children) {
        await deleteCommentRecursively(child._id);
    }

    // Delete all direct children
    await Comment.deleteMany({ parentId: commentId });

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);
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

        // Count total comments/replies that will be deleted for post count update
        const countToDelete = async (parentId) => {
            const children = await Comment.find({ parentId });
            let total = children.length;

            for (const child of children) {
                total += await countToDelete(child._id);
            }

            return total;
        };

        const totalToDelete = 1 + await countToDelete(commentId);

        // Recursively delete comment and all its nested replies
        await deleteCommentRecursively(commentId);

        // Update post's comment count
        // Note: The middleware will handle individual decrements, but we need to adjust for the total
        // Since middleware decrements one by one, we don't need additional adjustment here

        res.status(200).json({
            message: "Comment deleted successfully",
            deletedCount: totalToDelete
        });
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