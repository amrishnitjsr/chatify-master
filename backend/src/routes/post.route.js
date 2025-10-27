import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createPost,
    getAllPosts,
    getUserPosts,
    toggleLikePost,
    getPostById,
    deletePost,
} from "../controllers/post.controller.js";
import {
    addComment,
    getPostComments,
    getCommentReplies,
    deleteComment,
    updateComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// Post routes
router.post("/", protectRoute, createPost); // Create a new post
router.get("/", protectRoute, getAllPosts); // Get all posts (with pagination)
router.get("/user/:userId", protectRoute, getUserPosts); // Get posts by user
router.get("/:postId", protectRoute, getPostById); // Get single post
router.delete("/:postId", protectRoute, deletePost); // Delete post
router.post("/:postId/like", protectRoute, toggleLikePost); // Like/unlike post

// Comment routes
router.post("/:postId/comments", protectRoute, addComment); // Add comment to post
router.get("/:postId/comments", protectRoute, getPostComments); // Get comments for post
router.get("/comments/:commentId/replies", protectRoute, getCommentReplies); // Get replies for comment
router.put("/comments/:commentId", protectRoute, updateComment); // Update comment
router.delete("/comments/:commentId", protectRoute, deleteComment); // Delete comment

export default router;