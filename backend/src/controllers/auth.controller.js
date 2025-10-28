import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import { createNotification } from "./notification.controller.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  console.log("📝 Signup attempt:", { fullName, email, passwordProvided: !!password });

  try {
    if (!fullName || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // before CR:
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after CR:
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Login attempt:", { email, passwordProvided: !!password });

  if (!email || !password) {
    console.log("❌ Missing credentials");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log("🔍 Looking for user with email:", email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ User found:", user.fullName);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log("❌ Invalid password for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password correct, generating token");
    generateToken(user._id, res);

    console.log("✅ Login successful for:", user.fullName);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("💥 Error in login controller:", error);

    // Check if it's a database connection error
    if (error.name === 'MongooseError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ message: "Database connection error. Please try again later." });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, website, location, profilePic } = req.body;
    const userId = req.user._id;

    // Check if username is unique (if provided and different from current)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Prepare update object
    const updateData = {};
    if (fullName !== undefined && fullName !== "") updateData.fullName = fullName;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (location !== undefined) updateData.location = location;

    // Handle profile picture upload if provided (base64 format)
    if (profilePic && profilePic.startsWith('data:image/')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: 'profile_pics',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        updateData.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.log("Error uploading image:", uploadError);
        return res.status(400).json({ message: "Failed to upload image" });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user?._id; // Current user viewing the profile

    const user = await User.findById(userId)
      .select("-password")
      .populate('followers', 'fullName username profilePic')
      .populate('following', 'fullName username profilePic');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send profile view notification (only if viewing someone else's profile)
    if (viewerId && viewerId.toString() !== userId) {
      const viewer = await User.findById(viewerId).select('fullName');
      if (viewer) {
        await createNotification({
          recipientId: userId,
          senderId: viewerId,
          type: "profile_view",
          message: `${viewer.fullName} viewed your profile`,
          entityId: viewerId,
          entityType: "user"
        });
      }
    }

    res.status(200).json({
      user: {
        ...user.toObject(),
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    console.log("Error in get user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
