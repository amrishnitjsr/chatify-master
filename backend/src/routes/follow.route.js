import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    toggleFollow,
    getFollowers,
    getFollowing,
    checkFollowStatus,
    getSuggestedUsers
} from "../controllers/follow.controller.js";

const router = express.Router();

// Toggle follow/unfollow
router.post("/:userId", protectRoute, toggleFollow);

// Check follow status
router.get("/status/:userId", protectRoute, checkFollowStatus);

// Get followers
router.get("/:userId/followers", protectRoute, getFollowers);

// Get following
router.get("/:userId/following", protectRoute, getFollowing);

// Get suggested users
router.get("/suggestions", protectRoute, getSuggestedUsers);

export default router;