import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET, NODE_ENV } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Determine cookie settings based on environment
  const isProduction = NODE_ENV === "production";
  const isDevelopment = NODE_ENV === "development";
  
  console.log("🍪 Setting JWT cookie - Environment:", NODE_ENV, "Production:", isProduction);

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in MS
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    sameSite: isProduction ? "none" : "lax", // Use 'none' for cross-origin in production
    secure: isProduction, // HTTPS required in production
    // Don't set domain to allow cross-subdomain sharing
  });

  console.log("🍪 JWT cookie set with sameSite:", isProduction ? "none" : "lax", "secure:", isProduction);

  return token;
};

// http://localhost
// https://dsmakmk.com
