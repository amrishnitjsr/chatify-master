import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { devUtils } from "../lib/config.js";
import soundManager from "../lib/soundManager.js";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  onlineUsers: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newValue);
    set({ isSoundEnabled: newValue });

    // Play a sound to confirm the toggle (if being enabled)
    if (newValue) {
      soundManager.playMessageSent();
    }

    toast.success(`Message sounds ${newValue ? 'enabled' : 'disabled'}`, {
      icon: newValue ? '🔊' : '🔇',
      duration: 2000
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getUnreadMessageCount: () => {
    const { chats } = get();
    // In a real app, this would track unread messages per chat
    // For now, we'll simulate with a count based on number of chats
    return chats.length > 0 ? Math.min(chats.length, 9) : 0;
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    devUtils.log('📤 Sending message:', {
      to: selectedUser.fullName,
      hasText: !!messageData.text,
      hasImage: !!messageData.image
    });

    const tempId = `temp-${Date.now()}`;

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages
      isEncrypted: false, // Don't encrypt optimistic messages for immediate display
    };

    // Immediately update the UI by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      // Send the message to backend (backend will handle encryption)
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

      // Replace optimistic message with server response
      const updatedMessages = messages.filter(msg => msg._id !== tempId);
      set({ messages: [...updatedMessages, res.data] });

      // Refresh chat partners list (in case this was the first message to this user)
      get().getMyChatPartners();

      // Play message sent sound
      if (get().isSoundEnabled) {
        soundManager.playMessageSent();
      }

      devUtils.log('✅ Message sent successfully');
    } catch (error) {
      // Remove optimistic message on failure
      const failedMessages = messages.filter(msg => msg._id !== tempId);
      set({ messages: failedMessages });

      devUtils.error('❌ Failed to send message:', error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        soundManager.playMessageReceived();
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Online users management
  setOnlineUsers: (users) => set({ onlineUsers: users || [] }),

  subscribeToOnlineUsers: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users || [] });
    });
  },

  unsubscribeFromOnlineUsers: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("getOnlineUsers");
  },
}));
