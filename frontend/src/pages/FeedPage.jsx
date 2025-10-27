import { useEffect, useState } from "react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import PostCard from "../components/posts/PostCard";
import CreatePostForm from "../components/posts/CreatePostForm";
import PostsLoadingSkeleton from "../components/posts/PostsLoadingSkeleton";
import Navbar from "../components/Navbar";
import { RefreshCwIcon } from "lucide-react";

const FeedPage = () => {
    const {
        posts,
        fetchPosts,
        isPostsLoading,
        currentPage,
        hasNextPage,
    } = usePostStore();

    const { authUser } = useAuthStore();
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        // Fetch posts when component mounts
        fetchPosts(1);
    }, [fetchPosts]);

    const handleLoadMore = () => {
        if (hasNextPage && !isPostsLoading) {
            fetchPosts(currentPage + 1);
        }
    };

    const handleRefresh = () => {
        fetchPosts(1);
    };

    if (!authUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-white text-xl">Please log in to view the feed</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">
                            📱 Feed
                        </h1>
                        <button
                            onClick={handleRefresh}
                            disabled={isPostsLoading}
                            className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                            title="Refresh posts"
                        >
                            <RefreshCwIcon className={`size-4 ${isPostsLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <p className="text-slate-400">
                        Share your thoughts and connect with others
                    </p>
                </div>

                {/* Create Post Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="w-full btn btn-primary btn-outline hover:btn-primary transition-all duration-200"
                    >
                        ✏️ Create New Post
                    </button>
                </div>

                {/* Create Post Form */}
                {showCreateForm && (
                    <div className="mb-6">
                        <CreatePostForm
                            onClose={() => setShowCreateForm(false)}
                            onSuccess={() => setShowCreateForm(false)}
                        />
                    </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-6">
                    {/* Loading skeleton for initial load */}
                    {isPostsLoading && posts.length === 0 && (
                        <PostsLoadingSkeleton />
                    )}

                    {/* Posts list */}
                    {posts.map((post, index) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            index={index}
                        />
                    ))}

                    {/* No posts message */}
                    {!isPostsLoading && posts.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No posts yet
                            </h3>
                            <p className="text-slate-400 mb-4">
                                Be the first to share something!
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn btn-primary"
                            >
                                Create First Post
                            </button>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasNextPage && posts.length > 0 && (
                        <div className="text-center pt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={isPostsLoading}
                                className="btn btn-outline btn-wide"
                            >
                                {isPostsLoading ? (
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
                        <div className="text-center py-8 border-t border-slate-700/50">
                            <p className="text-slate-400 text-sm">
                                🎉 You've reached the end of the feed!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedPage;