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
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
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

    // listen for new notifications
    socket.on("newNotification", (notification) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification(notification);

      // Show toast notification based on type
      const getIcon = (type) => {
        switch (type) {
          case 'follow': return '👤';
          case 'unfollow': return '🚶';
          case 'message': return '💬';
          case 'profile_view': return '👁️';
          default: return '🔔';
        }
      };

      // Play notification sound if enabled
      if (get().notificationSoundEnabled) {
        if (notification.type === 'follow' || notification.type === 'unfollow') {
          soundManager.playFollowNotification();
        } else {
          soundManager.playNotification();
        }
      }

      toast(`${notification.message}`, {
        icon: getIcon(notification.type),
        duration: 4000,
      });
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
