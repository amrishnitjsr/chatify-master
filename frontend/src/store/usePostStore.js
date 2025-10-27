import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { devUtils } from "../lib/config.js";

export const usePostStore = create((set, get) => ({
    // State
    posts: [],
    userPosts: [],
    selectedPost: null,
    comments: {},
    profileUser: null,

    // Loading states
    isPostsLoading: false,
    isUserPostsLoading: false,
    isCreatingPost: false,
    isLoadingComments: false,
    isAddingComment: false,
    isLoadingMore: false,
    isLoadingMoreUserPosts: false,

    // Pagination
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,

    // User posts pagination
    userPostsPagination: {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        totalPosts: 0
    },

    // Actions

    // Fetch all posts with pagination
    fetchPosts: async (page = 1, reset = false) => {
        set({ isPostsLoading: true });
        try {
            devUtils.log('📄 Fetching posts, page:', page);

            const res = await axiosInstance.get(`/posts?page=${page}&limit=20`);
            const { posts, pagination } = res.data;

            if (page === 1 || reset) {
                // Replace posts for first page or reset
                set({
                    posts,
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    hasNextPage: pagination.hasNext,
                    hasPrevPage: pagination.hasPrev,
                });
            } else {
                // Append posts for subsequent pages (infinite scroll)
                set(state => ({
                    posts: [...state.posts, ...posts],
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    hasNextPage: pagination.hasNext,
                    hasPrevPage: pagination.hasPrev,
                }));
            }

            devUtils.log('✅ Posts fetched successfully:', posts.length);
        } catch (error) {
            devUtils.error('❌ Failed to fetch posts:', error);
            toast.error(error.response?.data?.message || "Failed to fetch posts");
        } finally {
            set({ isPostsLoading: false });
        }
    },

    // Load more posts for infinite scroll
    loadMorePosts: async () => {
        const { currentPage, hasNextPage } = get();
        if (!hasNextPage) return;

        set({ isLoadingMore: true });
        try {
            const nextPage = currentPage + 1;
            devUtils.log('📄 Loading more posts, page:', nextPage);

            const res = await axiosInstance.get(`/posts?page=${nextPage}&limit=20`);
            const { posts, pagination } = res.data;

            set(state => ({
                posts: [...state.posts, ...posts],
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                hasNextPage: pagination.hasNext,
                hasPrevPage: pagination.hasPrev,
            }));

            devUtils.log('✅ More posts loaded:', posts.length);
        } catch (error) {
            devUtils.error('❌ Failed to load more posts:', error);
            toast.error("Failed to load more posts");
        } finally {
            set({ isLoadingMore: false });
        }
    },

    // Fetch posts by specific user
    fetchUserPosts: async (userId, page = 1, reset = false) => {
        set({ isUserPostsLoading: true });
        try {
            devUtils.log('👤 Fetching user posts:', { userId, page });

            const res = await axiosInstance.get(`/posts/user/${userId}?page=${page}&limit=20`);
            const { posts, user, pagination } = res.data;

            if (page === 1 || reset) {
                set({
                    userPosts: posts,
                    profileUser: user,
                    userPostsPagination: pagination
                });
            } else {
                set(state => ({
                    userPosts: [...state.userPosts, ...posts],
                    userPostsPagination: pagination
                }));
            }

            devUtils.log('✅ User posts fetched:', posts.length);
        } catch (error) {
            devUtils.error('❌ Failed to fetch user posts:', error);
            toast.error(error.response?.data?.message || "Failed to fetch user posts");
        } finally {
            set({ isUserPostsLoading: false });
        }
    },

    // Load more user posts
    loadMoreUserPosts: async (userId) => {
        const { userPostsPagination } = get();
        if (!userPostsPagination?.hasNext) return;

        set({ isLoadingMoreUserPosts: true });
        try {
            const nextPage = userPostsPagination.currentPage + 1;
            devUtils.log('👤 Loading more user posts:', { userId, page: nextPage });

            const res = await axiosInstance.get(`/posts/user/${userId}?page=${nextPage}&limit=20`);
            const { posts, pagination } = res.data;

            set(state => ({
                userPosts: [...state.userPosts, ...posts],
                userPostsPagination: pagination
            }));

            devUtils.log('✅ More user posts loaded:', posts.length);
        } catch (error) {
            devUtils.error('❌ Failed to load more user posts:', error);
            toast.error("Failed to load more posts");
        } finally {
            set({ isLoadingMoreUserPosts: false });
        }
    },

    // Create a new post
    createPost: async (postData) => {
        set({ isCreatingPost: true });
        try {
            devUtils.log('📝 Creating new post:', { hasText: !!postData.text, hasImage: !!postData.image });

            const res = await axiosInstance.post("/posts", postData);
            const newPost = res.data;

            // Add to beginning of posts array
            set(state => ({
                posts: [newPost, ...state.posts]
            }));

            toast.success("Post created successfully!");
            devUtils.log('✅ Post created:', newPost._id);

            return newPost;
        } catch (error) {
            devUtils.error('❌ Failed to create post:', error);
            toast.error(error.response?.data?.message || "Failed to create post");
            throw error;
        } finally {
            set({ isCreatingPost: false });
        }
    },

    // Toggle like on a post
    toggleLike: async (postId) => {
        try {
            devUtils.log('❤️ Toggling like for post:', postId);

            // Optimistic update
            set(state => ({
                posts: state.posts.map(post => {
                    if (post._id === postId) {
                        const hasLiked = post.hasLiked;
                        return {
                            ...post,
                            hasLiked: !hasLiked,
                            likeCount: hasLiked ? post.likeCount - 1 : post.likeCount + 1,
                        };
                    }
                    return post;
                })
            }));

            const res = await axiosInstance.post(`/posts/${postId}/like`);
            const { likeCount, hasLiked } = res.data;

            // Update with server response
            set(state => ({
                posts: state.posts.map(p =>
                    p._id === postId
                        ? { ...p, likeCount, hasLiked }
                        : p
                )
            }));

            devUtils.log('✅ Like toggled successfully');
        } catch (error) {
            devUtils.error('❌ Failed to toggle like:', error);

            // Revert optimistic update
            set(state => ({
                posts: state.posts.map(post => {
                    if (post._id === postId) {
                        const hasLiked = post.hasLiked;
                        return {
                            ...post,
                            hasLiked: !hasLiked,
                            likeCount: hasLiked ? post.likeCount - 1 : post.likeCount + 1,
                        };
                    }
                    return post;
                })
            }));

            toast.error(error.response?.data?.message || "Failed to update like");
        }
    },

    // Fetch comments for a post
    fetchComments: async (postId) => {
        set({ isLoadingComments: true });
        try {
            devUtils.log('💬 Fetching comments for post:', postId);

            const res = await axiosInstance.get(`/posts/${postId}/comments`);
            const { comments } = res.data;

            set(state => ({
                comments: {
                    ...state.comments,
                    [postId]: comments
                }
            }));

            devUtils.log('✅ Comments fetched:', comments.length);
        } catch (error) {
            devUtils.error('❌ Failed to fetch comments:', error);
            toast.error(error.response?.data?.message || "Failed to fetch comments");
        } finally {
            set({ isLoadingComments: false });
        }
    },

    // Add a comment to a post
    addComment: async (postId, text, parentId = null) => {
        set({ isAddingComment: true });
        try {
            devUtils.log('💬 Adding comment:', { postId, parentId, hasText: !!text });

            const res = await axiosInstance.post(`/posts/${postId}/comments`, {
                text,
                parentId
            });
            const newComment = res.data;

            // Update comments in state
            set(state => {
                const postComments = state.comments[postId] || [];

                if (parentId) {
                    // This is a reply - add to parent's replies
                    const updatedComments = postComments.map(comment => {
                        if (comment._id === parentId) {
                            return {
                                ...comment,
                                replies: [...(comment.replies || []), newComment]
                            };
                        }
                        return comment;
                    });

                    return {
                        comments: {
                            ...state.comments,
                            [postId]: updatedComments
                        }
                    };
                } else {
                    // This is a top-level comment
                    return {
                        comments: {
                            ...state.comments,
                            [postId]: [...postComments, { ...newComment, replies: [] }]
                        }
                    };
                }
            });

            // Update post comment count
            set(state => ({
                posts: state.posts.map(post =>
                    post._id === postId
                        ? { ...post, commentCount: post.commentCount + 1 }
                        : post
                )
            }));

            toast.success("Comment added successfully!");
            devUtils.log('✅ Comment added:', newComment._id);

            return newComment;
        } catch (error) {
            devUtils.error('❌ Failed to add comment:', error);
            toast.error(error.response?.data?.message || "Failed to add comment");
            throw error;
        } finally {
            set({ isAddingComment: false });
        }
    },

    // Delete a post
    deletePost: async (postId) => {
        try {
            devUtils.log('🗑️ Deleting post:', postId);

            await axiosInstance.delete(`/posts/${postId}`);

            // Remove from state
            set(state => ({
                posts: state.posts.filter(post => post._id !== postId),
                comments: {
                    ...state.comments,
                    [postId]: undefined // Remove comments for this post
                }
            }));

            toast.success("Post deleted successfully!");
            devUtils.log('✅ Post deleted');
        } catch (error) {
            devUtils.error('❌ Failed to delete post:', error);
            toast.error(error.response?.data?.message || "Failed to delete post");
        }
    },

    // Set selected post
    setSelectedPost: (post) => set({ selectedPost: post }),

    // Clear posts (for refresh)
    clearPosts: () => set({ posts: [], currentPage: 1, totalPages: 1 }),

    // Get comments for a specific post
    getCommentsForPost: (postId) => {
        const state = get();
        return state.comments[postId] || [];
    },
}));