import User from "../models/User.js";
import { createNotification } from "./notification.controller.js";

// Follow/Unfollow a user
export const toggleFollow = async (req, res) => {
    try {
        const { userId } = req.params; // User to follow/unfollow
        const currentUserId = req.user._id; // Current logged in user

        // Check if trying to follow themselves
        if (userId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Find both users
        const userToFollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(userId);

        if (isFollowing) {
            // Unfollow: Remove from following and followers lists
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: userId }
            });
            await User.findByIdAndUpdate(userId, {
                $pull: { followers: currentUserId }
            });

            // Send unfollow notification
            await createNotification({
                recipientId: userId,
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
                $push: { following: userId }
            });
            await User.findByIdAndUpdate(userId, {
                $push: { followers: currentUserId }
            });

            // Send follow notification
            await createNotification({
                recipientId: userId,
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

        const user = await User.findById(userId)
            .populate({
                path: 'followers',
                select: 'fullName username email profilePic bio',
                options: {
                    skip: skip,
                    limit: limit
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalFollowers = user.followers.length;
        const totalPages = Math.ceil(totalFollowers / limit);

        res.status(200).json({
            followers: user.followers,
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

        const user = await User.findById(userId)
            .populate({
                path: 'following',
                select: 'fullName username email profilePic bio',
                options: {
                    skip: skip,
                    limit: limit
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalFollowing = user.following.length;
        const totalPages = Math.ceil(totalFollowing / limit);

        res.status(200).json({
            following: user.following,
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

        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following.includes(userId);

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