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
  'https://social-media-a31j.onrender.com'
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
    
    if (allowedOrigins.includes(origin)) {
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

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();

  // Initialize story cleanup jobs
  initializeStoryCleanup();
});
