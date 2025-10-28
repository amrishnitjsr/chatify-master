import Story from "../models/Story.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";

// Create a new story
export const createStory = async (req, res) => {
    try {
        const { content, contentType, text, backgroundColor } = req.body;
        const userId = req.user._id;

        let processedContent = content;

        // If content is provided and it's an image/video, upload to Cloudinary
        if (content && contentType !== "text") {
            try {
                const uploadResponse = await uploadToCloudinary(content);
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
        const currentUser = await User.findById(userId);

        // Get stories from users the current user follows + their own stories
        const followingIds = [...currentUser.following, userId];

        const stories = await Story.aggregate([
            {
                $match: {
                    userId: { $in: followingIds },
                    isActive: true,
                    expiresAt: { $gt: new Date() },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $group: {
                    _id: "$userId",
                    user: { $first: "$user" },
                    stories: {
                        $push: {
                            _id: "$_id",
                            content: "$content",
                            contentType: "$contentType",
                            text: "$text",
                            backgroundColor: "$backgroundColor",
                            viewers: "$viewers",
                            createdAt: "$createdAt",
                            expiresAt: "$expiresAt",
                        },
                    },
                    latestStory: { $max: "$createdAt" },
                },
            },
            {
                $project: {
                    user: {
                        _id: "$user._id",
                        fullName: "$user.fullName",
                        profilePic: "$user.profilePic",
                        username: "$user.username",
                    },
                    stories: 1,
                    latestStory: 1,
                    hasUnseenStories: {
                        $anyElementTrue: {
                            $map: {
                                input: "$stories",
                                as: "story",
                                in: {
                                    $not: {
                                        $in: [userId, "$$story.viewers.userId"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $sort: { latestStory: -1 },
            },
        ]);

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