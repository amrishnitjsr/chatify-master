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
    const { authUser, getUserProfile } = useAuthStore();
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
    const [profileTab, setProfileTab] = useState("posts"); // posts, reels, tagged
    const [showMenu, setShowMenu] = useState(false);
    const [viewedUser, setViewedUser] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const isOwnProfile = authUser?._id === userId;

    // Determine which user data to display
    const displayUser = isOwnProfile ? authUser : (viewedUser || profileUser);

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

            // Fetch user profile (this will trigger profile view notification for other users)
            const fetchProfile = async () => {
                if (!isOwnProfile) {
                    setIsLoadingProfile(true);
                    const user = await getUserProfile(userId);
                    setViewedUser(user);
                    setIsLoadingProfile(false);
                } else {
                    setViewedUser(null);
                }
            };

            fetchProfile();

            // Load follow data
            if (!isOwnProfile) {
                checkFollowStatus(userId);
            }

            // Fetch follow counts for the profile
            fetchFollowCounts(userId);
        }
    }, [userId, fetchUserPosts, isOwnProfile, checkFollowStatus, fetchFollowCounts, getUserProfile]);

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
            // Navigate to home (which shows the Chatify layout with chat)
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
        <div className="h-full overflow-y-auto bg-black md:bg-slate-900">
            {/* Mobile Header - Chatify Style */}
            <div className="md:hidden bg-black border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}>
                            <ArrowLeftIcon className="size-6 text-white" />
                        </button>
                        <h1 className="text-lg font-semibold text-white">
                            {displayUser?.username || 'Profile'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button>
                            <ShareIcon className="size-6 text-white" />
                        </button>
                        <button onClick={() => setShowMenu(!showMenu)}>
                            <MoreVerticalIcon className="size-6 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto md:px-4 md:py-8">
                {/* Profile Header */}
                <div className="p-4 md:p-0">
                    <div className="flex items-start gap-4 md:gap-8 mb-6">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                            {displayUser?.profilePic ? (
                                <img
                                    src={displayUser.profilePic}
                                    alt="Profile"
                                    className="size-20 md:size-32 rounded-full object-cover"
                                />
                            ) : (
                                <div className="size-20 md:size-32 rounded-full bg-slate-700 flex items-center justify-center">
                                    <UserIcon className="size-8 md:size-16 text-slate-400" />
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            {/* Username and Buttons */}
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-xl md:text-2xl font-semibold text-white truncate">
                                    {displayUser?.fullName}
                                </h1>

                                {!isOwnProfile ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleFollow(userId)}
                                            disabled={isToggling}
                                            className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${isUserFollowing
                                                ? "bg-slate-600 hover:bg-slate-500 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                                }`}
                                        >
                                            {isToggling ? "..." : isUserFollowing ? "Following" : "Follow"}
                                        </button>
                                        <button
                                            onClick={handleMessageUser}
                                            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
                                        >
                                            Message
                                        </button>
                                        <button className="p-2 text-white hover:text-slate-300">
                                            <UserPlusIcon className="size-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
                                        >
                                            Edit profile
                                        </button>
                                        <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors">
                                            Share profile
                                        </button>
                                        <button className="p-2 text-white hover:text-slate-300">
                                            <UserPlusIcon className="size-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Stats - Mobile */}
                            <div className="md:hidden flex items-center justify-around bg-slate-800/50 rounded-lg p-3 mb-4">
                                <div className="text-center">
                                    <div className="font-semibold text-white text-lg">{userPostsPagination?.totalPosts || 0}</div>
                                    <div className="text-slate-400 text-sm">posts</div>
                                </div>
                                <div className="text-center cursor-pointer" onClick={() => setShowFollowersModal(true)}>
                                    <div className="font-semibold text-white text-lg">{followersCount}</div>
                                    <div className="text-slate-400 text-sm">followers</div>
                                </div>
                                <div className="text-center cursor-pointer" onClick={() => setShowFollowersModal(true)}>
                                    <div className="font-semibold text-white text-lg">{followingCount}</div>
                                    <div className="text-slate-400 text-sm">following</div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-4">
                                <p className="text-white font-medium mb-1">{displayUser?.fullName}</p>
                                <p className="text-white text-sm">
                                    {displayUser?.bio || "No bio yet"}
                                </p>
                                <p className="text-blue-400 text-sm">
                                    {displayUser?.website}
                                </p>
                            </div>

                            {/* Stats - Desktop */}
                            <div className="hidden md:flex items-center gap-8">
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
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex gap-3 overflow-x-auto pb-2 mb-6 px-1">
                        {/* New Highlight */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="size-16 md:size-20 rounded-full border-2 border-slate-600 flex items-center justify-center bg-slate-800">
                                <PlusIcon className="size-6 text-slate-400" />
                            </div>
                            <p className="text-xs text-white text-center mt-1">New</p>
                        </div>

                        {/* Sample Highlights */}
                        {["Highlights", "Highlights", "Highlights", "Highlights"].map((highlight, index) => (
                            <div key={index} className="flex-shrink-0 flex flex-col items-center">
                                <div className="size-16 md:size-20 rounded-full border-2 border-slate-600 bg-slate-700">
                                    {/* Highlight image would go here */}
                                </div>
                                <p className="text-xs text-white text-center mt-1 truncate w-16">{highlight}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="border-t border-slate-800 md:border-slate-700">
                    <div className="flex">
                        <button
                            onClick={() => setProfileTab("posts")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "posts"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <GridIcon className="size-4" />
                            <span className="hidden md:inline">POSTS</span>
                        </button>
                        <button
                            onClick={() => setProfileTab("reels")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "reels"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <PlayIcon className="size-4" />
                            <span className="hidden md:inline">REELS</span>
                        </button>
                        <button
                            onClick={() => setProfileTab("tagged")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "tagged"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <BookmarkIcon className="size-4" />
                            <span className="hidden md:inline">TAGGED</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Based on Active Tab */}
            <div className="px-0 md:px-0">

                {/* Posts Loading State */}
                {isUserPostsLoading && userPosts.length === 0 ? (
                    <PostsLoadingSkeleton />
                ) : (
                    <>
                        {/* Posts Tab */}
                        {profileTab === "posts" && (
                            <>
                                {/* Chatify-Style Posts Grid */}
                                <div className="grid grid-cols-3 gap-1 md:gap-4">
                                    {userPosts.length === 0 ? (
                                        <div className="col-span-3 text-center py-16">
                                            <div className="w-24 h-24 rounded-full border-2 border-slate-600 flex items-center justify-center mx-auto mb-4">
                                                <svg className="size-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-1">
                                                {isOwnProfile ? "Share Photos" : "No Posts Yet"}
                                            </h3>
                                            <p className="text-slate-400">
                                                {isOwnProfile
                                                    ? "When you share photos, they'll appear on your profile."
                                                    : "When they share photos, you'll see them here."
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        userPosts.map((post, index) => (
                                            <div key={post._id} className="aspect-square bg-slate-800 rounded-none md:rounded-lg overflow-hidden relative group cursor-pointer">
                                                {post.imageUrl ? (
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={`Post ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                        <span className="text-slate-400 text-sm p-2 text-center line-clamp-3">
                                                            {post.text}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Desktop hover overlay */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                                                    <div className="flex items-center gap-6 text-white">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                            </svg>
                                                            <span className="font-semibold">{post.likes?.length || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
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
                                            className="px-6 py-2 text-blue-500 font-medium text-sm"
                                        >
                                            {isLoadingMoreUserPosts ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                                    Loading more...
                                                </>
                                            ) : (
                                                'Show More'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Reels Tab */}
                        {profileTab === "reels" && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 rounded-full border-2 border-slate-600 flex items-center justify-center mb-4">
                                    <PlayIcon className="size-12 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">No Reels Yet</h3>
                                <p className="text-slate-400">Reels you share will appear here.</p>
                            </div>
                        )}

                        {/* Tagged Tab */}
                        {profileTab === "tagged" && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 rounded-full border-2 border-slate-600 flex items-center justify-center mb-4">
                                    <BookmarkIcon className="size-12 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">No Tagged Posts</h3>
                                <p className="text-slate-400">When people tag you in photos, they'll appear here.</p>
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