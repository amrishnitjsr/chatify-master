import Story from "../models/Story.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new story
export const createStory = async (req, res) => {
    try {
        const { content, contentType, text, backgroundColor } = req.body;
        const userId = req.user._id;

        let processedContent = content;

        // If content is provided and it's an image/video, upload to Cloudinary
        if (content && contentType !== "text") {
            try {
                const uploadResponse = await cloudinary.uploader.upload(content, {
                    resource_type: "auto", // Automatically detect if it's image or video
                    folder: "chatify/stories"
                });
                processedContent = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(400).json({ message: "Failed to upload media" });
            }
        }

        const story = new Story({
            userId,
            content: processedContent,
            contentType: contentType || "image",
            text: text || "",
            backgroundColor: backgroundColor || "#000000",
        });

        await story.save();

        // Populate user info for response
        await story.populate("userId", "fullName profilePic username");

        console.log("Story created successfully:", {
            storyId: story._id,
            userId: story.userId._id,
            userFullName: story.userId.fullName,
            contentType: story.contentType,
            expiresAt: story.expiresAt
        });

        res.status(201).json({
            message: "Story created successfully",
            story,
        });
    } catch (error) {
        console.error("Error in createStory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all active stories from users the current user follows + their own stories
export const getStories = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log("Getting stories for user:", userId);

        const currentUser = await User.findById(userId).populate('following', '_id');
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Current user:", {
            _id: currentUser._id,
            fullName: currentUser.fullName,
            followingCount: currentUser.following?.length || 0,
            following: currentUser.following?.map(f => f._id?.toString() || f.toString())
        });

        // Get stories from users the current user follows + their own stories + everyone for now (public mode)
        // This makes it work like Instagram where you can see everyone's stories
        const allUsers = await User.find({}, '_id');
        const followingUserIds = (currentUser.following || []).map(f => f._id || f);
        const followingIds = [...followingUserIds, userId, ...allUsers.map(u => u._id)];

        // Remove duplicates
        const uniqueFollowingIds = [...new Set(followingIds.map(id => id.toString()))].map(id => id);

        console.log("Following count:", followingUserIds.length);
        console.log("Total story sources:", uniqueFollowingIds.length);

        // Get all active stories from followed users and all users (public mode for testing)
        const activeStories = await Story.find({
            isActive: true,
            expiresAt: { $gt: new Date() },
        })
            .populate('userId', 'fullName profilePic username')
            .sort({ createdAt: -1 });

        console.log("Found active stories:", activeStories.length);

        // Group stories by user
        const storyGroups = {};

        activeStories.forEach(story => {
            const storyUserId = story.userId._id.toString();

            if (!storyGroups[storyUserId]) {
                storyGroups[storyUserId] = {
                    _id: story.userId._id,
                    user: {
                        _id: story.userId._id,
                        fullName: story.userId.fullName,
                        profilePic: story.userId.profilePic,
                        username: story.userId.username,
                    },
                    stories: [],
                    latestStory: story.createdAt,
                    hasUnseenStories: false,
                };
            }

            // Check if current user has viewed this story
            const hasViewed = story.viewers.some(viewer =>
                viewer.userId.toString() === userId.toString()
            );

            if (!hasViewed) {
                storyGroups[storyUserId].hasUnseenStories = true;
            }

            // Add story to group
            storyGroups[storyUserId].stories.push({
                _id: story._id,
                content: story.content,
                contentType: story.contentType,
                text: story.text,
                backgroundColor: story.backgroundColor,
                viewers: story.viewers,
                createdAt: story.createdAt,
                expiresAt: story.expiresAt,
            });

            // Update latest story time
            if (story.createdAt > storyGroups[storyUserId].latestStory) {
                storyGroups[storyUserId].latestStory = story.createdAt;
            }
        });

        // Convert to array and sort by latest story
        const stories = Object.values(storyGroups).map(group => ({
            ...group,
            stories: group.stories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first for viewing
        })).sort((a, b) =>
            new Date(b.latestStory) - new Date(a.latestStory)
        );

        console.log("Returning story groups:", stories.length);
        res.status(200).json({ stories });
    } catch (error) {
        console.error("Error in getStories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific user's stories
export const getUserStories = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const stories = await Story.find({
            userId,
            isActive: true,
            expiresAt: { $gt: new Date() },
        })
            .populate("userId", "fullName profilePic username")
            .sort({ createdAt: 1 }); // Oldest first for viewing

        res.status(200).json({ stories });
    } catch (error) {
        console.error("Error in getUserStories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark story as viewed
export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if user already viewed this story
        const alreadyViewed = story.viewers.some(
            (viewer) => viewer.userId.toString() === userId.toString()
        );

        if (!alreadyViewed) {
            story.viewers.push({
                userId,
                viewedAt: new Date(),
            });
            await story.save();
        }

        res.status(200).json({ message: "Story viewed successfully" });
    } catch (error) {
        console.error("Error in viewStory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a story
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if user owns the story
        if (story.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this story" });
        }

        await Story.findByIdAndDelete(storyId);

        res.status(200).json({ message: "Story deleted successfully" });
    } catch (error) {
        console.error("Error in deleteStory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get story viewers
export const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId).populate(
            "viewers.userId",
            "fullName profilePic username"
        );

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if user owns the story
        if (story.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to view story viewers" });
        }

        res.status(200).json({ viewers: story.viewers });
    } catch (error) {
        console.error("Error in getStoryViewers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};