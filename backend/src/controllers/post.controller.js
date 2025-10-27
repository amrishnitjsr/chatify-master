import cloudinary from "../lib/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { text, image } = req.body;
        const userId = req.user._id;

        // Validate input - require either text or image
        if ((!text || text.trim() === "") && !image) {
            return res.status(400).json({ message: "Post must contain either text or an image" });
        }

        if (text && text.length > 5000) {
            return res.status(400).json({ message: "Post text too long (max 5000 characters)" });
        }

        let imageUrl = null;

        // Handle image upload if provided
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: "chatify_posts",
                    resource_type: "image",
                });
                imageUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);

                // If we have text, continue without the image
                // If we only have image and it fails, return error
                if (!text || text.trim() === "") {
                    return res.status(400).json({ message: "Failed to upload image and no text provided" });
                }

                console.log("Creating post without image due to Cloudinary error");
                // Continue with imageUrl = null
            }
        }

        // Create new post
        const newPost = new Post({
            userId,
            text: text.trim(),
            imageUrl,
        });

        await newPost.save();

        // Populate user information for response
        await newPost.populate('userId', 'fullName profilePic');

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all posts (with pagination)
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: -1 }) // Most recent first
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts: total,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get posts by a specific user
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ userId })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            posts,
            user: {
                _id: user._id,
                fullName: user.fullName,
                profilePic: user.profilePic,
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts: total,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Like or unlike a post
export const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike the post
            post.likes.pull(userId);
        } else {
            // Like the post
            post.likes.push(userId);
        }

        await post.save();

        // Return updated post with user info
        await post.populate('userId', 'fullName profilePic');

        res.status(200).json({
            post,
            action: hasLiked ? 'unliked' : 'liked',
            likeCount: post.likes.length,
            hasLiked: !hasLiked,
        });
    } catch (error) {
        console.error("Error toggling post like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate('userId', 'fullName profilePic')
            .lean();

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if current user has liked this post
        const hasLiked = post.likes.includes(req.user._id);

        res.status(200).json({
            ...post,
            hasLiked,
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a post (only by the author)
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the author
        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        // Delete all comments associated with this post
        await Comment.deleteMany({ postId });

        // Delete the post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};