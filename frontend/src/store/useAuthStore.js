import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { config, devUtils } from "../lib/config.js";
import useNotificationStore from "./useNotificationStore.js";
import { useStoryStore } from "./useStoryStore.js";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

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

      toast(`${notification.message}`, {
        icon: getIcon(notification.type),
        duration: 4000,
      });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
