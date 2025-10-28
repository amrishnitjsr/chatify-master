import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    // Fetch notifications
    fetchNotifications: async (page = 1) => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get(`/notifications?page=${page}&limit=20`);

            if (page === 1) {
                set({
                    notifications: response.data.notifications || [],
                    unreadCount: response.data.unreadCount || 0
                });
            } else {
                set((state) => ({
                    notifications: [...state.notifications, ...(response.data.notifications || [])]
                }));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ notifications: [], unreadCount: 0 });
        } finally {
            set({ isLoading: false });
        }
    },

    // Get unread count
    fetchUnreadCount: async () => {
        try {
            const response = await axiosInstance.get('/notifications/unread-count');
            set({ unreadCount: response.data.unreadCount || 0 });
        } catch (error) {
            console.error('Error fetching unread count:', error);
            set({ unreadCount: 0 });
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            await axiosInstance.patch('/notifications/mark-read', {
                notificationIds: [notificationId]
            });

            set((state) => ({
                notifications: state.notifications.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            await axiosInstance.patch('/notifications/mark-read');

            set((state) => ({
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    isRead: true
                })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            await axiosInstance.delete('/notifications', {
                data: { notificationIds: [notificationId] }
            });

            set((state) => {
                const notification = state.notifications.find(n => n._id === notificationId);
                return {
                    notifications: state.notifications.filter(n => n._id !== notificationId),
                    unreadCount: notification && !notification.isRead
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount
                };
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    },

    // Clear all notifications
    clearAllNotifications: async () => {
        try {
            await axiosInstance.delete('/notifications');
            set({ notifications: [], unreadCount: 0 });
        } catch (error) {
            console.error('Error clearing all notifications:', error);
        }
    },

    // Add new notification (for real-time)
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    // Reset state
    resetNotifications: () => {
        set({ notifications: [], unreadCount: 0, isLoading: false });
    }
}));

export default useNotificationStore;