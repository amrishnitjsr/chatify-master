import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFollowStore = create((set, get) => ({
    // State
    followingUsers: new Set(), // IDs of users the current user is following
    userFollowCounts: {}, // Store follow counts for different users
    suggestedUsers: [],
    followers: [],
    following: [],

    // Loading states
    isToggling: false,
    isLoadingSuggested: false,
    isLoadingFollowers: false,
    isLoadingFollowing: false,

    // Toggle follow/unfollow
    toggleFollow: async (userId) => {
        if (get().isToggling) return;

        set({ isToggling: true });
        try {
            const response = await axiosInstance.post(`/follow/${userId}`);
            const { isFollowing, followersCount, followingCount } = response.data;

            set(state => {
                const newFollowingUsers = new Set(state.followingUsers);
                if (isFollowing) {
                    newFollowingUsers.add(userId);
                } else {
                    newFollowingUsers.delete(userId);
                }

                // Get current user ID (assuming it's available in auth store or can be passed)
                const currentUserId = JSON.parse(localStorage.getItem('user-info'))?.user?._id;

                return {
                    followingUsers: newFollowingUsers,
                    userFollowCounts: {
                        ...state.userFollowCounts,
                        [userId]: {
                            ...state.userFollowCounts[userId],
                            followersCount
                        },
                        // Update current user's following count
                        ...(currentUserId && {
                            [currentUserId]: {
                                ...state.userFollowCounts[currentUserId],
                                followingCount
                            }
                        })
                    }
                };
            });

            toast.success(response.data.message);
            return isFollowing;
        } catch (error) {
            console.error("Toggle follow error:", error);
            toast.error(error.response?.data?.message || "Failed to update follow status");
            throw error;
        } finally {
            set({ isToggling: false });
        }
    },

    // Check if following a user
    isFollowing: (userId) => {
        return get().followingUsers.has(userId);
    },

    // Get follow status
    checkFollowStatus: async (userId) => {
        try {
            const response = await axiosInstance.get(`/follow/status/${userId}`);
            const { isFollowing } = response.data;

            set(state => {
                const newFollowingUsers = new Set(state.followingUsers);
                if (isFollowing) {
                    newFollowingUsers.add(userId);
                } else {
                    newFollowingUsers.delete(userId);
                }
                return { followingUsers: newFollowingUsers };
            });

            return isFollowing;
        } catch (error) {
            console.error("Check follow status error:", error);
            return false;
        }
    },

    // Get suggested users
    fetchSuggestedUsers: async (limit = 5) => {
        set({ isLoadingSuggested: true });
        try {
            const response = await axiosInstance.get(`/follow/suggestions?limit=${limit}`);
            set({ suggestedUsers: response.data.users || [] });
        } catch (error) {
            console.error("Fetch suggested users error:", error);
            set({ suggestedUsers: [] });
        } finally {
            set({ isLoadingSuggested: false });
        }
    },

    // Get user's followers
    fetchFollowers: async (userId, page = 1) => {
        set({ isLoadingFollowers: true });
        try {
            const response = await axiosInstance.get(`/follow/${userId}/followers?page=${page}`);
            set({ followers: response.data.followers || [] });
            return response.data;
        } catch (error) {
            console.error("Fetch followers error:", error);
            set({ followers: [] });
            throw error;
        } finally {
            set({ isLoadingFollowers: false });
        }
    },

    // Get user's following
    fetchFollowing: async (userId, page = 1) => {
        set({ isLoadingFollowing: true });
        try {
            const response = await axiosInstance.get(`/follow/${userId}/following?page=${page}`);
            set({ following: response.data.following || [] });
            return response.data;
        } catch (error) {
            console.error("Fetch following error:", error);
            set({ following: [] });
            throw error;
        } finally {
            set({ isLoadingFollowing: false });
        }
    },

    // Get user profile with follow counts
    fetchUserProfile: async (userId) => {
        try {
            const response = await axiosInstance.get(`/auth/profile/${userId}`);
            const userData = response.data.user;

            set(state => ({
                userFollowCounts: {
                    ...state.userFollowCounts,
                    [userId]: {
                        followersCount: userData.followersCount,
                        followingCount: userData.followingCount
                    }
                }
            }));

            return userData;
        } catch (error) {
            console.error("Fetch user profile error:", error);
            throw error;
        }
    },

    // Fetch and cache follow counts for a user
    fetchFollowCounts: async (userId) => {
        try {
            // Use the existing user profile endpoint which includes follow counts
            const response = await axiosInstance.get(`/auth/profile/${userId}`);
            const { user } = response.data;
            const { followersCount, followingCount, followers } = user;

            set(state => ({
                userFollowCounts: {
                    ...state.userFollowCounts,
                    [userId]: {
                        followersCount: followersCount || followers?.length || 0,
                        followingCount: followingCount || 0
                    }
                }
            }));

            return {
                followersCount: followersCount || followers?.length || 0,
                followingCount: followingCount || 0
            };
        } catch (error) {
            console.error("Fetch follow counts error:", error);
            return { followersCount: 0, followingCount: 0 };
        }
    },

    // Get follow counts for a user
    getFollowCounts: (userId) => {
        const counts = get().userFollowCounts[userId];
        return {
            followersCount: counts?.followersCount || 0,
            followingCount: counts?.followingCount || 0
        };
    },

    // Clear all data (for logout)
    clearFollowData: () => {
        set({
            followingUsers: new Set(),
            userFollowCounts: {},
            suggestedUsers: [],
            followers: [],
            following: []
        });
    }
}));