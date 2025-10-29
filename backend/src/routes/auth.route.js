import express from "express";
import { signup, login, logout, updateProfile, getUserProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply Arcjet protection only to sensitive routes, not signup/login
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", arcjetProtection, protectRoute, updateProfile);
// Public profile endpoint (no auth required)
router.get("/profile/:userId", getUserProfile);

// Private profile endpoint (auth required for sensitive data)
router.get("/profile/:userId/private", arcjetProtection, protectRoute, getUserProfile);

router.get("/check", arcjetProtection, protectRoute, (req, res) => res.status(200).json(req.user));

// Debug endpoint to check cookies without authentication
router.get("/debug-cookies", (req, res) => {
    console.log("🍪 Debug cookies - All cookies:", req.cookies);
    console.log("🍪 Debug cookies - Headers:", req.headers.cookie);
    res.json({
        cookies: req.cookies,
        hasCookies: !!req.cookies,
        jwtPresent: !!req.cookies?.jwt,
        cookieHeader: req.headers.cookie
    });
});

export default router;
