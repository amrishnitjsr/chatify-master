import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

// Helper function to create notifications
export const createNotification = async ({
    recipientId,
    senderId,
    type,
    message,
    entityId = null,
    entityType = null,
    metadata = {}
}) => {
    try {
        // Don't send notification to yourself
        if (recipientId.toString() === senderId.toString()) {
            return null;
        }

        // Check if similar notification already exists (to avoid spam)
        const existingNotification = await Notification.findOne({
            recipient: recipientId,
            sender: senderId,
            type,
            entityId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        if (existingNotification && type !== "message") {
            // Update existing notification instead of creating duplicate
            existingNotification.message = message;
            existingNotification.isRead = false;
            existingNotification.metadata = metadata;
            existingNotification.createdAt = new Date();
            await existingNotification.save();
            await existingNotification.populate("sender", "fullName profilePic username");

            // Send real-time notification update to recipient
            const receiverSocketId = getReceiverSocketId(recipientId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", existingNotification);
            }

            return existingNotification;
        }

        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            message,
            entityId,
            entityType,
            metadata,
        });

        await notification.save();
        await notification.populate("sender", "fullName profilePic username");

        // Send real-time notification to recipient
        const receiverSocketId = getReceiverSocketId(recipientId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", notification);
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "fullName profilePic username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalNotifications = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.status(200).json({
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalCount: totalNotifications,
                hasNext: page < Math.ceil(totalNotifications / limit),
                hasPrev: page > 1,
            },
            unreadCount,
        });
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationIds } = req.body;

        if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications as read
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipient: userId
                },
                { isRead: true }
            );
        } else {
            // Mark all notifications as read
            await Notification.updateMany(
                { recipient: userId },
                { isRead: true }
            );
        }

        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete notifications
export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationIds } = req.body;

        if (notificationIds && notificationIds.length > 0) {
            // Delete specific notifications
            await Notification.deleteMany({
                _id: { $in: notificationIds },
                recipient: userId,
            });
        } else {
            // Delete all notifications
            await Notification.deleteMany({ recipient: userId });
        }

        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNotifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error("Error in getUnreadCount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};