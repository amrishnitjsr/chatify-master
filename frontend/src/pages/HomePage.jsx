import { useEffect, useState } from "react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import PostCard from "../components/posts/PostCard";
import CreatePostForm from "../components/posts/CreatePostForm";
import PostsLoadingSkeleton from "../components/posts/PostsLoadingSkeleton";
import { RefreshCwIcon, PlusIcon, HomeIcon } from "lucide-react";

const HomePage = () => {
    const {
        posts,
        fetchPosts,
        isPostsLoading,
        hasNextPage,
        loadMorePosts,
        isLoadingMore
    } = usePostStore();

    const { authUser } = useAuthStore();
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        // Fetch posts when component mounts
        fetchPosts(1, true); // page 1, reset posts
    }, [fetchPosts]);

    const handleRefresh = () => {
        fetchPosts(1, true);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isLoadingMore) {
            loadMorePosts();
        }
    };

    if (!authUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Please log in to view the home feed</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">
                            🏠 Home Feed
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="btn btn-primary btn-sm"
                                title="Create new post"
                            >
                                <PlusIcon className="size-4" />
                                <span className="hidden sm:inline">New Post</span>
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={isPostsLoading}
                                className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                                title="Refresh posts"
                            >
                                <RefreshCwIcon className={`size-4 ${isPostsLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Post Form */}
                {showCreateForm && (
                    <div className="mb-6">
                        <CreatePostForm onPostCreated={() => setShowCreateForm(false)} />
                    </div>
                )}

                {/* Posts Loading State */}
                {isPostsLoading && posts.length === 0 ? (
                    <PostsLoadingSkeleton />
                ) : (
                    <>
                        {/* Posts List */}
                        <div className="space-y-6">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-slate-400 mb-4">
                                        <HomeIcon className="size-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                                        <p className="text-sm">Be the first to share something with the community!</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="btn btn-primary"
                                    >
                                        <PlusIcon className="size-4" />
                                        Create First Post
                                    </button>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))
                            )}
                        </div>

                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="btn btn-outline btn-wide"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Loading more...
                                        </>
                                    ) : (
                                        'Load More Posts'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* End of feed message */}
                        {!hasNextPage && posts.length > 0 && (
                            <div className="text-center py-8">
                                <div className="text-slate-400 text-sm">
                                    🎉 You've reached the end of the feed!
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;