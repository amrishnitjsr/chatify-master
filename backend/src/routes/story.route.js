import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createStory,
    getStories,
    getUserStories,
    viewStory,
    deleteStory,
    getStoryViewers,
} from "../controllers/story.controller.js";

const router = express.Router();

// Create a new story
router.post("/", protectRoute, createStory);

// Get all stories from followed users + own stories
router.get("/", protectRoute, getStories);

// Get specific user's stories
router.get("/user/:userId", protectRoute, getUserStories);

// Mark story as viewed
router.post("/:storyId/view", protectRoute, viewStory);

// Delete a story
router.delete("/:storyId", protectRoute, deleteStory);

// Get story viewers
router.get("/:storyId/viewers", protectRoute, getStoryViewers);

// Manual cleanup endpoint (for testing)
router.post("/cleanup", protectRoute, async (req, res) => {
    try {
        const { runManualCleanup } = await import("../lib/storyCleanup.js");
        await runManualCleanup();
        res.json({ message: "Story cleanup completed successfully" });
    } catch (error) {
        console.error("Manual cleanup error:", error);
        res.status(500).json({ message: "Error during cleanup" });
    }
});

export default router;