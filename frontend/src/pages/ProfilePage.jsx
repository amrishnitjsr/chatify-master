import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFollowStore } from "../store/useFollowStore";
import { useChatStore } from "../store/useChatStore";
import PostCard from "../components/posts/PostCard";
import PostsLoadingSkeleton from "../components/posts/PostsLoadingSkeleton";
import EditProfileModal from "../components/EditProfileModal";
import FollowersModal from "../components/FollowersModal";
import {
    UserIcon,
    CalendarIcon,
    RefreshCwIcon,
    ArrowLeftIcon,
    ShareIcon,
    MoreVerticalIcon,
    GridIcon,
    PlayIcon,
    BookmarkIcon,
    PlusIcon,
    UserPlusIcon
} from "lucide-react";

const ProfilePage = ({ userId: propUserId }) => {
    const { userId: paramUserId } = useParams();
    const userId = propUserId || paramUserId;
    const navigate = useNavigate();
    const { authUser } = useAuthStore();
    const { setSelectedUser, setActiveTab } = useChatStore();
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const isOwnProfile = authUser?._id === userId;

    const {
        toggleFollow,
        isFollowing,
        checkFollowStatus,
        getFollowCounts,
        fetchFollowCounts,
        isToggling
    } = useFollowStore();


    const isUserFollowing = isFollowing(userId);
    const { followersCount, followingCount } = getFollowCounts(userId);

    useEffect(() => {
        if (userId) {
            fetchUserPosts(userId, 1, true); // Reset posts for new user

            // Load follow data
            if (!isOwnProfile) {
                checkFollowStatus(userId);
            }

            // Fetch follow counts for the profile
            fetchFollowCounts(userId);
        }
    }, [userId, fetchUserPosts, isOwnProfile, checkFollowStatus, fetchFollowCounts]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUserPosts(userId, 1, true);
        setIsRefreshing(false);
    };

    const handleLoadMore = () => {
        if (userPostsPagination?.hasNext) {
            loadMoreUserPosts(userId);
        }
    };

    const handleMessageUser = () => {
        if (profileUser) {
            // Set the selected user in chat store
            setSelectedUser(profileUser);
            // Switch to messages tab
            setActiveTab("chats");
            // Navigate to home (which shows the Instagram layout with chat)
            navigate("/");
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
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Instagram-Style Profile Header */}
                <div className="mb-8">
                    <div className="flex items-start gap-8 mb-6">
                        {/* Profile Picture with Instagram Gradient */}
                        <div className="relative">
                            <div className="p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full">
                                {profileUser?.profilePic || authUser?.profilePic ? (
                                    <img
                                        src={profileUser?.profilePic || authUser?.profilePic}
                                        alt="Profile"
                                        className="size-32 rounded-full object-cover border-4 border-slate-900"
                                    />
                                ) : (
                                    <div className="size-32 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-900">
                                        <UserIcon className="size-16 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            {/* Username and Actions */}
                            <div className="flex items-center gap-6 mb-6">
                                <h1 className="text-2xl text-white font-normal">
                                    {(profileUser?.fullName || authUser?.fullName)?.toLowerCase().replace(/\s+/g, '') || 'username'}
                                </h1>

                                {!isOwnProfile ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleFollow(userId)}
                                            disabled={isToggling}
                                            className={`px-6 py-1.5 rounded-lg font-semibold transition-colors ${isUserFollowing
                                                ? "bg-slate-600 hover:bg-slate-500 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                                }`}
                                        >
                                            {isToggling ? "..." : isUserFollowing ? "Following" : "Follow"}
                                        </button>
                                        <button
                                            onClick={handleMessageUser}
                                            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-1.5 rounded-lg font-semibold transition-colors"
                                        >
                                            Message
                                        </button>
                                        <button className="text-white hover:text-slate-300 p-2">
                                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-1.5 rounded-lg font-semibold transition-colors"
                                        >
                                            Edit profile
                                        </button>
                                        <button className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-1.5 rounded-lg font-semibold transition-colors">
                                            View archive
                                        </button>
                                        <button
                                            onClick={handleRefresh}
                                            disabled={isRefreshing}
                                            className="text-white hover:text-slate-300 p-2"
                                            title="Refresh posts"
                                        >
                                            <RefreshCwIcon className={`size-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8 mb-4">
                                <div className="text-white">
                                    <span className="font-semibold">{userPostsPagination?.totalPosts || 0}</span> posts
                                </div>
                                <div
                                    className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setShowFollowersModal(true)}
                                >
                                    <span className="font-semibold">{followersCount}</span> followers
                                </div>
                                <div
                                    className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setShowFollowersModal(true)}
                                >
                                    <span className="font-semibold">{followingCount}</span> following
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="text-white">
                                <div className="font-semibold mb-1">
                                    {profileUser?.fullName || authUser?.fullName}
                                </div>
                                <div className="text-slate-300 text-sm">
                                    {(profileUser?.bio || authUser?.bio) ? (
                                        <div className="whitespace-pre-line">{profileUser?.bio || authUser?.bio}</div>
                                    ) : (
                                        <>
                                            ✨ Living my best life<br />
                                            📍 Earth<br />
                                            💫 Spreading positivity
                                        </>
                                    )}
                                </div>
                                {(profileUser?.website || authUser?.website) && (
                                    <a
                                        href={profileUser?.website || authUser?.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-sm mt-1 block"
                                    >
                                        {profileUser?.website || authUser?.website}
                                    </a>
                                )}
                                {(profileUser?.location || authUser?.location) && (
                                    <div className="text-slate-400 text-sm mt-1">
                                        📍 {profileUser?.location || authUser?.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Story Highlights */}
                    <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-2">
                        {[1, 2, 3, 4, 5].map((highlight) => (
                            <div key={highlight} className="flex flex-col items-center gap-2 min-w-0">
                                <div className="size-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                                    <svg className="size-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-slate-300 text-xs">Highlights</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Navigation Tabs */}
                <div className="border-t border-slate-700 mb-6">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-12">
                            <button className="flex items-center gap-2 py-4 text-white border-t border-white -mt-px">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                POSTS
                            </button>
                            <button className="flex items-center gap-2 py-4 text-slate-400">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                REELS
                            </button>
                            <button className="flex items-center gap-2 py-4 text-slate-400">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z" />
                                </svg>
                                TAGGED
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts Loading State */}
                {isUserPostsLoading && userPosts.length === 0 ? (
                    <PostsLoadingSkeleton />
                ) : (
                    <>
                        {/* Instagram-Style Posts Grid */}
                        <div className="grid grid-cols-3 gap-1 sm:gap-4">
                            {userPosts.length === 0 ? (
                                <div className="col-span-3 text-center py-12">
                                    <UserIcon className="size-16 mx-auto mb-4 opacity-50 text-slate-400" />
                                    <h3 className="text-xl font-semibold mb-2 text-white">
                                        {isOwnProfile ? "Share Photos" : "No Posts Yet"}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {isOwnProfile
                                            ? "When you share photos, they will appear on your profile."
                                            : "When they share photos, you'll see them here."
                                        }
                                    </p>
                                </div>
                            ) : (
                                userPosts.map((post, index) => (
                                    <div key={post._id} className="aspect-square bg-slate-700 rounded-lg overflow-hidden relative group cursor-pointer">
                                        {post.imageUrl ? (
                                            <img
                                                src={post.imageUrl}
                                                alt={`Post ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-700">
                                                <span className="text-slate-400 text-sm p-2 text-center line-clamp-3">
                                                    {post.text}
                                                </span>
                                            </div>
                                        )}
                                        {/* Hover overlay with stats */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="flex items-center gap-1">
                                                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                    <span className="font-semibold">{post.likes?.length || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M13.5,16L10.5,14H9V10H11.5L14.5,8L13.5,16Z" />
                                                    </svg>
                                                    <span className="font-semibold">{post.commentCount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
            />

            {/* Followers/Following Modal */}
            <FollowersModal
                isOpen={showFollowersModal}
                onClose={() => setShowFollowersModal(false)}
                userId={userId}
            />
        </div>
    );
};

export default ProfilePage;