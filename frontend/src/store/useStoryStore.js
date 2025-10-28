import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStoryStore = create((set, get) => ({
    // State
    stories: [], // Array of user story groups
    currentStoryGroup: null, // Currently viewing story group
    currentStoryIndex: 0, // Current story index within group
    isLoadingStories: false,
    isCreatingStory: false,
    isViewingStory: false,
    storyViewers: [],
    storyRefreshInterval: null,

    // Create a new story
    createStory: async (storyData) => {
        set({ isCreatingStory: true });
        try {
            const response = await axiosInstance.post("/stories", storyData);

            // Add the new story to existing stories or create new story group
            const newStory = response.data.story;
            const currentStories = get().stories;

            const existingGroupIndex = currentStories.findIndex(
                group => group.user._id === newStory.userId._id
            );

            let updatedStories;
            if (existingGroupIndex >= 0) {
                // Add to existing story group
                updatedStories = [...currentStories];
                updatedStories[existingGroupIndex].stories.push(newStory);
                updatedStories[existingGroupIndex].latestStory = newStory.createdAt;
            } else {
                // Create new story group
                const newStoryGroup = {
                    _id: newStory.userId._id,
                    user: newStory.userId,
                    stories: [newStory],
                    latestStory: newStory.createdAt,
                    hasUnseenStories: false, // User's own story
                };
                updatedStories = [newStoryGroup, ...currentStories];
            }

            set({ stories: updatedStories });
            toast.success("Story created successfully!");
            return response.data;
        } catch (error) {
            console.error("Create story error:", error);
            const errorMessage = error.response?.data?.message || "Failed to create story";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isCreatingStory: false });
        }
    },

    // Fetch all stories
    fetchStories: async () => {
        set({ isLoadingStories: true });
        try {
            const response = await axiosInstance.get("/stories");
            
            // Filter out expired stories on client side
            const now = new Date();
            const validStories = (response.data.stories || []).filter(story => {
                const expiresAt = new Date(story.expiresAt);
                return expiresAt > now && story.isActive !== false;
            });

            set({ stories: validStories });
            return response.data.stories || [];
        } catch (error) {
            console.error("❌ Fetch stories error:", error.response?.data || error.message);
            set({ stories: [] });
            throw error;
        } finally {
            set({ isLoadingStories: false });
        }
    },

    // Fetch specific user's stories
    fetchUserStories: async (userId) => {
        try {
            const response = await axiosInstance.get(`/stories/user/${userId}`);
            return response.data.stories;
        } catch (error) {
            console.error("Fetch user stories error:", error);
            throw error;
        }
    },

    // View a story (mark as viewed)
    viewStory: async (storyId) => {
        try {
            await axiosInstance.post(`/stories/${storyId}/view`);

            // Update the story as viewed in local state
            const stories = get().stories;
            const updatedStories = stories.map(storyGroup => ({
                ...storyGroup,
                stories: storyGroup.stories.map(story =>
                    story._id === storyId
                        ? { ...story, isViewed: true }
                        : story
                ),
            }));

            set({ stories: updatedStories });
        } catch (error) {
            console.error("View story error:", error);
            throw error;
        }
    },

    // Delete a story
    deleteStory: async (storyId) => {
        try {
            await axiosInstance.delete(`/stories/${storyId}`);

            // Remove story from local state
            const stories = get().stories;
            const updatedStories = stories.map(storyGroup => ({
                ...storyGroup,
                stories: storyGroup.stories.filter(story => story._id !== storyId),
            })).filter(storyGroup => storyGroup.stories.length > 0); // Remove empty groups

            set({ stories: updatedStories });
            toast.success("Story deleted successfully!");
        } catch (error) {
            console.error("Delete story error:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete story";
            toast.error(errorMessage);
            throw error;
        }
    },

    // Get story viewers
    getStoryViewers: async (storyId) => {
        try {
            const response = await axiosInstance.get(`/stories/${storyId}/viewers`);
            set({ storyViewers: response.data.viewers });
            return response.data.viewers;
        } catch (error) {
            console.error("Get story viewers error:", error);
            throw error;
        }
    },

    // Story viewer state management
    setCurrentStoryGroup: (storyGroup) => {
        set({
            currentStoryGroup: storyGroup,
            currentStoryIndex: 0,
            isViewingStory: true
        });
    },

    setCurrentStoryIndex: (index) => {
        set({ currentStoryIndex: index });
    },

    closeStoryViewer: () => {
        set({
            currentStoryGroup: null,
            currentStoryIndex: 0,
            isViewingStory: false
        });
    },

    nextStory: () => {
        const { currentStoryGroup, currentStoryIndex } = get();
        if (currentStoryGroup && currentStoryIndex < currentStoryGroup.stories.length - 1) {
            set({ currentStoryIndex: currentStoryIndex + 1 });
            return true;
        }
        return false;
    },

    previousStory: () => {
        const { currentStoryIndex } = get();
        if (currentStoryIndex > 0) {
            set({ currentStoryIndex: currentStoryIndex - 1 });
            return true;
        }
        return false;
    },

    nextStoryGroup: () => {
        const { stories, currentStoryGroup } = get();
        const currentGroupIndex = stories.findIndex(
            group => group._id === currentStoryGroup?._id
        );

        if (currentGroupIndex >= 0 && currentGroupIndex < stories.length - 1) {
            const nextGroup = stories[currentGroupIndex + 1];
            set({
                currentStoryGroup: nextGroup,
                currentStoryIndex: 0
            });
            return true;
        }
        return false;
    },

    previousStoryGroup: () => {
        const { stories, currentStoryGroup } = get();
        const currentGroupIndex = stories.findIndex(
            group => group._id === currentStoryGroup?._id
        );

        if (currentGroupIndex > 0) {
            const previousGroup = stories[currentGroupIndex - 1];
            set({
                currentStoryGroup: previousGroup,
                currentStoryIndex: 0
            });
            return true;
        }
        return false;
    },

    // Start automatic story refresh
    startStoryRefresh: () => {
        const { storyRefreshInterval } = get();

        // Clear existing interval if any
        if (storyRefreshInterval) {
            clearInterval(storyRefreshInterval);
        }

        // Refresh stories every 5 minutes to catch expired ones
        const interval = setInterval(() => {
            get().fetchStories();
        }, 5 * 60 * 1000); // 5 minutes

        set({ storyRefreshInterval: interval });
    },

    // Stop automatic story refresh
    stopStoryRefresh: () => {
        const { storyRefreshInterval } = get();
        if (storyRefreshInterval) {
            clearInterval(storyRefreshInterval);
            set({ storyRefreshInterval: null });
        }
    },

    // Check and remove expired stories from local state
    removeExpiredStories: () => {
        const { stories } = get();
        const now = new Date();

        const validStories = stories.filter(story => {
            const expiresAt = new Date(story.expiresAt);
            return expiresAt > now && story.isActive !== false;
        });

        // Only update if stories were actually removed
        if (validStories.length !== stories.length) {
            set({ stories: validStories });
        }
    },

    // Clear all data (logout)
    clearStoryData: () => {
        const { stopStoryRefresh } = get();
        stopStoryRefresh();

        set({
            stories: [],
            currentStoryGroup: null,
            currentStoryIndex: 0,
            isLoadingStories: false,
            isCreatingStory: false,
            isViewingStory: false,
            storyViewers: [],
            storyRefreshInterval: null,
        });
    },
}));