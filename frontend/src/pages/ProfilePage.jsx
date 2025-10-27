import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import PostCard from "../components/posts/PostCard";
import PostsLoadingSkeleton from "../components/posts/PostsLoadingSkeleton";
import { UserIcon, CalendarIcon, RefreshCwIcon } from "lucide-react";

const ProfilePage = () => {
    const { userId } = useParams();
    const { authUser } = useAuthStore();
    const {
        userPosts,
        fetchUserPosts,
        isUserPostsLoading,
        userPostsPagination,
        loadMoreUserPosts,
        isLoadingMoreUserPosts,
        profileUser
    } = usePostStore();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const isOwnProfile = authUser?._id === userId;

    useEffect(() => {
        if (userId) {
            fetchUserPosts(userId, 1, true); // Reset posts for new user
        }
    }, [userId, fetchUserPosts]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUserPosts(userId, 1, true);
        setIsRefreshing(false);
    };

    const handleLoadMore = () => {
        if (userPostsPagination?.hasNext && !isLoadingMoreUserPosts) {
            loadMoreUserPosts(userId);
        }
    };

    if (!authUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Please log in to view profiles</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700/50">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Profile Picture */}
                        <div className="relative">
                            {profileUser?.profilePic || authUser?.profilePic ? (
                                <img
                                    src={profileUser?.profilePic || authUser?.profilePic}
                                    alt="Profile"
                                    className="size-24 rounded-full object-cover border-4 border-primary/20"
                                />
                            ) : (
                                <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20">
                                    <UserIcon className="size-12 text-primary" />
                                </div>
                            )}
                            {isOwnProfile && (
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                    You
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                {profileUser?.fullName || authUser?.fullName}
                            </h1>

                            <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-400 text-sm mb-4">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="size-4" />
                                    <span>Joined {new Date(profileUser?.createdAt || authUser?.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{userPostsPagination?.totalPosts || 0}</div>
                                    <div className="text-slate-400">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">
                                        {userPosts?.reduce((acc, post) => acc + (post.likes?.length || 0), 0) || 0}
                                    </div>
                                    <div className="text-slate-400">Likes Received</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                                title="Refresh posts"
                            >
                                <RefreshCwIcon className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isOwnProfile ? 'Your Posts' : `${profileUser?.fullName || 'User'}'s Posts`}
                    </h2>
                </div>

                {/* Posts Loading State */}
                {isUserPostsLoading && userPosts.length === 0 ? (
                    <PostsLoadingSkeleton />
                ) : (
                    <>
                        {/* Posts List */}
                        <div className="space-y-6">
                            {userPosts.length === 0 ? (
                                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <UserIcon className="size-16 mx-auto mb-4 opacity-50 text-slate-400" />
                                    <h3 className="text-xl font-semibold mb-2 text-white">
                                        {isOwnProfile ? "You haven't posted anything yet" : "No posts to show"}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {isOwnProfile
                                            ? "Share your first post with the community!"
                                            : "This user hasn't shared anything yet."
                                        }
                                    </p>
                                </div>
                            ) : (
                                userPosts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))
                            )}
                        </div>

                        {/* Load More Button */}
                        {userPostsPagination?.hasNext && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMoreUserPosts}
                                    className="btn btn-outline btn-wide"
                                >
                                    {isLoadingMoreUserPosts ? (
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

                        {/* End of posts message */}
                        {!userPostsPagination?.hasNext && userPosts.length > 0 && (
                            <div className="text-center py-8">
                                <div className="text-slate-400 text-sm">
                                    📄 All posts loaded
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;