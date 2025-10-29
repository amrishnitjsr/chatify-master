import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { config, devUtils } from "../lib/config.js";
import useNotificationStore from "./useNotificationStore.js";
import { useStoryStore } from "./useStoryStore.js";
import soundManager from "../lib/soundManager.js";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],
  notificationSoundEnabled: JSON.parse(localStorage.getItem("notificationSoundEnabled")) !== false, // Default true

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();

      // Initialize notifications
      const { fetchUnreadCount } = useNotificationStore.getState();
      fetchUnreadCount();

      // Start story refresh
      const { startStoryRefresh } = useStoryStore.getState();
      startStoryRefresh();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
      get().connectSocket();

      // Initialize notifications
      const { fetchUnreadCount } = useNotificationStore.getState();
      fetchUnreadCount();

      // Start story refresh
      const { startStoryRefresh } = useStoryStore.getState();
      startStoryRefresh();
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to create account. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();

      // Initialize notifications
      const { fetchUnreadCount } = useNotificationStore.getState();
      fetchUnreadCount();

      // Start story refresh
      const { startStoryRefresh } = useStoryStore.getState();
      startStoryRefresh();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to log in. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();

      // Stop story refresh and clear data
      const { clearStoryData } = useStoryStore.getState();
      clearStoryData();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  getUserProfile: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/profile/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
      return null;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    devUtils.log('Connecting to socket:', config.socket.url);

    const socket = io(config.socket.url, config.socket.options);

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // listen for new notifications (both events for compatibility)
    socket.on("newNotification", (notification) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification(notification);

      // Play notification sound if enabled (no popup toast)
      if (get().notificationSoundEnabled) {
        if (notification.type === 'follow' || notification.type === 'unfollow') {
          soundManager.playFollowNotification();
        } else {
          soundManager.playNotification();
        }
      }

      console.log("📬 New notification received:", notification.message);
    });

    // Also listen for the "notification" event from backend
    socket.on("notification", (notification) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification(notification);

      // Play notification sound if enabled (no popup toast)
      if (get().notificationSoundEnabled) {
        if (notification.type === 'follow' || notification.type === 'unfollow' || notification.type === 'post_share') {
          soundManager.playFollowNotification();
        } else {
          soundManager.playNotification();
        }
      }

      console.log("📬 Real-time notification received:", notification.message);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  toggleNotificationSound: () => {
    const newValue = !get().notificationSoundEnabled;
    localStorage.setItem("notificationSoundEnabled", JSON.stringify(newValue));
    set({ notificationSoundEnabled: newValue });

    // Play a sound to confirm the toggle (if being enabled)
    if (newValue) {
      soundManager.playNotification();
    }

    toast.success(`Notification sounds ${newValue ? 'enabled' : 'disabled'}`, {
      icon: newValue ? '🔔' : '🔕',
      duration: 2000
    });
  },
}));
