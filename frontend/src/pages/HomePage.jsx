import { useEffect } from "react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import PostCard from "../components/posts/PostCard";
import PostsLoadingSkeleton from "../components/posts/PostsLoadingSkeleton";
import StoriesSection from "../components/StoriesSection";
import { RefreshCwIcon } from "lucide-react";

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
        <div className="h-full overflow-y-auto bg-black md:bg-slate-900">
            {/* Stories Section - Full width on mobile like Chatify */}
            <div className="border-b border-slate-800 md:border-slate-700 bg-black md:bg-transparent">
                <div className="p-4 md:p-6 md:max-w-2xl md:mx-auto">
                    <StoriesSection />
                </div>
            </div>

            {/* Posts Feed Container */}
            <div className="md:max-w-2xl md:mx-auto md:px-4 md:py-6">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Feed</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={isPostsLoading}
                        className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/30 transition-colors"
                        title="Refresh posts"
                    >
                        <RefreshCwIcon className={`size-5 ${isPostsLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Posts Loading State */}
                {isPostsLoading && posts.length === 0 ? (
                    <PostsLoadingSkeleton />
                ) : (
                    <>
                        {/* Posts List - No spacing on mobile, spacing on desktop */}
                        <div className="md:space-y-6">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-slate-400 mb-4">
                                        <div className="text-6xl mb-4">📱</div>
                                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                                        <p className="text-sm">When people you follow share posts, you'll see them here.</p>
                                    </div>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))
                            )}
                        </div>

                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="flex justify-center mt-8 px-4">
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