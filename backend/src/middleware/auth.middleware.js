import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🔒 Auth middleware - Cookies received:", Object.keys(req.cookies || {}));
    console.log("🔒 Auth middleware - JWT cookie:", req.cookies.jwt ? "Present" : "Missing");
    console.log("🔒 Auth middleware - User-Agent:", req.headers['user-agent']?.substring(0, 100));

    const token = req.cookies.jwt;
    if (!token) {
      console.log("❌ No JWT token in cookies - this might be expected for new users");
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        code: "NO_TOKEN",
        suggestion: "Please log in again"
      });
    }

    console.log("🔍 Verifying JWT token...");
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("❌ Invalid JWT token");
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
        code: "INVALID_TOKEN",
        suggestion: "Please log in again"
      });
    }

    console.log("✅ JWT token valid, finding user:", decoded.userId);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("❌ User not found in database:", decoded.userId);
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
        suggestion: "Please create a new account"
      });
    }

    console.log("✅ User authenticated:", user.fullName);
    req.user = user;
    next();
  } catch (error) {
    console.log("💥 Error in protectRoute middleware:", error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Unauthorized - Invalid token format",
        code: "MALFORMED_TOKEN",
        suggestion: "Please log in again"
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Unauthorized - Token expired",
        code: "TOKEN_EXPIRED",
        suggestion: "Please log in again"
      });
    }

    res.status(500).json({
      message: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
};
