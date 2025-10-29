import User from "../models/User.js";
import { createNotification } from "./notification.controller.js";

// Helper function to find user by ID or username
const findUserByIdOrUsername = async (identifier) => {
    let user;
    try {
        // First try to find by ObjectId
        user = await User.findById(identifier);
    } catch (error) {
        // If not a valid ObjectId, try finding by username
        user = null;
    }

    // If not found by ID, try by username
    if (!user) {
        user = await User.findOne({ username: identifier });
    }

    return user;
};

// Follow/Unfollow a user
export const toggleFollow = async (req, res) => {
    try {
        const { userId } = req.params; // User to follow/unfollow (can be ID or username)
        const currentUserId = req.user._id; // Current logged in user

        // Find user by ID or username
        const userToFollow = await findUserByIdOrUsername(userId);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if trying to follow themselves
        if (userToFollow._id.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Find current user
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following (use the actual user ID)
        const targetUserId = userToFollow._id;
        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow: Remove from following and followers lists
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $pull: { followers: currentUserId }
            });

            // Send unfollow notification
            await createNotification({
                recipientId: targetUserId,
                senderId: currentUserId,
                type: "unfollow",
                message: `${currentUser.fullName} unfollowed you`,
                entityId: currentUserId,
                entityType: "user"
            });

            res.status(200).json({
                message: "User unfollowed successfully",
                isFollowing: false,
                followersCount: userToFollow.followers.length - 1,
                followingCount: currentUser.following.length - 1
            });
        } else {
            // Follow: Add to following and followers lists
            await User.findByIdAndUpdate(currentUserId, {
                $push: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $push: { followers: currentUserId }
            });

            // Send follow notification
            await createNotification({
                recipientId: targetUserId,
                senderId: currentUserId,
                type: "follow",
                message: `${currentUser.fullName} started following you`,
                entityId: currentUserId,
                entityType: "user"
            });

            res.status(200).json({
                message: "User followed successfully",
                isFollowing: true,
                followersCount: userToFollow.followers.length + 1,
                followingCount: currentUser.following.length + 1
            });
        }
    } catch (error) {
        console.error("Error in toggleFollow:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's followers
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Find user by ID or username
        const user = await findUserByIdOrUsername(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Now populate followers using the actual user ID
        const populatedUser = await User.findById(user._id)
            .populate({
                path: 'followers',
                select: 'fullName username email profilePic bio',
                options: {
                    skip: skip,
                    limit: limit
                }
            });

        const totalFollowers = populatedUser.followers.length;
        const totalPages = Math.ceil(totalFollowers / limit);

        res.status(200).json({
            followers: populatedUser.followers,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: totalFollowers,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error in getFollowers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's following
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Find user by ID or username
        const user = await findUserByIdOrUsername(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Now populate following using the actual user ID
        const populatedUser = await User.findById(user._id)
            .populate({
                path: 'following',
                select: 'fullName username email profilePic bio',
                options: {
                    skip: skip,
                    limit: limit
                }
            });

        const totalFollowing = populatedUser.following.length;
        const totalPages = Math.ceil(totalFollowing / limit);

        res.status(200).json({
            following: populatedUser.following,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: totalFollowing,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error in getFollowing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check if current user is following another user
export const checkFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Find target user by ID or username
        const targetUser = await findUserByIdOrUsername(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following.includes(targetUser._id);

        res.status(200).json({ isFollowing });
    } catch (error) {
        console.error("Error in checkFollowStatus:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get suggested users to follow
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const limit = parseInt(req.query.limit) || 5;

        // Get current user's following list
        const currentUser = await User.findById(currentUserId).select('following');
        const followingIds = currentUser.following || [];

        // Find users that the current user is not following (excluding themselves)
        const suggestedUsers = await User.find({
            _id: {
                $nin: [...followingIds, currentUserId] // Exclude following and self
            }
        })
            .select('fullName username profilePic bio followers')
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest users first

        res.status(200).json({ users: suggestedUsers });
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};