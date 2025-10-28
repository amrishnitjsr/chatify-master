import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getNotifications,
    markAsRead,
    deleteNotifications,
    getUnreadCount,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", protectRoute, getNotifications);

// Get unread notification count
router.get("/unread-count", protectRoute, getUnreadCount);

// Mark notifications as read
router.patch("/mark-read", protectRoute, markAsRead);

// Delete notifications
router.delete("/", protectRoute, deleteNotifications);

export default router;