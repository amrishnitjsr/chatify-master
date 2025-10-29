import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import postRoutes from "./routes/post.route.js";
import followRoutes from "./routes/follow.route.js";
import storyRoutes from "./routes/story.route.js";
import notificationRoutes from "./routes/notification.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";
import { initializeStoryCleanup } from "./lib/storyCleanup.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body

// Configure CORS to allow multiple origins
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://chatify-frontend.onrender.com', // Add your frontend URL when deployed
  'https://chatify-frontend.vercel.app',
  'https://chatify-frontend-henna.vercel.app',// Common deployment URLs
  'https://chatify-frontend.netlify.app'
];

console.log('🌐 CORS Configuration - Allowed Origins:', allowedOrigins);
console.log('🌐 CLIENT_URL from ENV:', ENV.CLIENT_URL);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 CORS Origin Request:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('🌐 CORS: Allowing request with no origin');
      return callback(null, true);
    }

   const isAllowed = allowedOrigins.includes(origin) || 
                     (origin && origin.includes('vercel.app') && origin.includes('chatify-frontend'));

    if (isAllowed) {
      console.log('✅ CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocking origin:', origin, 'Allowed:', allowedOrigins.join(', '));
      callback(new Error(`Not allowed by CORS. Origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Support legacy browsers
}));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint for deployment platforms
app.get("/api/health", (_, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "chatify-backend"
  });
});

// Basic API info endpoint
app.get("/api", (_, res) => {
  res.json({
    message: "Chatify Backend API",
    version: "1.0.0",
    status: "running"
  });
});

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();

  // Initialize story cleanup jobs
  initializeStoryCleanup();
});
