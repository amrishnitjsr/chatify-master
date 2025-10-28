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
            {/* Mobile Header - Android Style */}
            <div className="md:hidden bg-black px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}>
                            <ArrowLeftIcon className="size-6 text-white" />
                        </button>
                        <h1 className="text-lg font-semibold text-white">
                            {displayUser?.username || 'Profile'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-1">
                            <div className="bg-red-500 text-white rounded-full p-2">
                                <span className="text-xs font-bold">9+</span>
                            </div>
                        </button>
                        <button className="p-1">
                            <div className="bg-red-500 text-white rounded-full p-2">
                                <span className="text-xs font-bold">1</span>
                            </div>
                        </button>
                        <button onClick={() => setShowMenu(!showMenu)} className="p-1">
                            <div className="flex flex-col gap-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto md:px-4 md:py-8">
                {/* Profile Header */}
                <div className="p-4 md:p-0">
                    {/* Profile Picture and Name Section */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-shrink-0">
                            {displayUser?.profilePic ? (
                                <img
                                    src={displayUser.profilePic}
                                    alt="Profile"
                                    className="size-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="size-20 rounded-full bg-slate-700 flex items-center justify-center">
                                    <UserIcon className="size-8 text-slate-400" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <PlusIcon className="size-4 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-white mb-1">
                                {displayUser?.fullName || displayUser?.username}
                            </h1>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-around text-center mb-6">
                        <div>
                            <div className="text-xl font-bold text-white">{userPostsPagination?.totalPosts || 0}</div>
                            <div className="text-sm text-slate-400">posts</div>
                        </div>
                        <div className="cursor-pointer" onClick={() => setShowFollowersModal(true)}>
                            <div className="text-xl font-bold text-white">{followersCount}</div>
                            <div className="text-sm text-slate-400">followers</div>
                        </div>
                        <div className="cursor-pointer" onClick={() => setShowFollowersModal(true)}>
                            <div className="text-xl font-bold text-white">{followingCount}</div>
                            <div className="text-sm text-slate-400">following</div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="mb-6">
                        <p className="text-blue-400 text-sm font-medium mb-1">
                            @{displayUser?.username || 'username'}
                        </p>
                        <p className="text-white text-sm font-medium mb-1">
                            {displayUser?.bio || displayUser?.fullName || 'B.Tech In (CS)2026'}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                            <span className="text-lg">🤠</span>
                            <span className="text-lg">🤓</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                            @{displayUser?.username || 'username'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-6">
                        {!isOwnProfile ? (
                            <>
                                <button
                                    onClick={() => toggleFollow(userId)}
                                    disabled={isToggling}
                                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm ${isUserFollowing
                                        ? "bg-slate-600 hover:bg-slate-500 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                >
                                    {isToggling ? "..." : isUserFollowing ? "Following" : "Follow"}
                                </button>
                                <button
                                    onClick={handleMessageUser}
                                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                                >
                                    Message
                                </button>
                                <button className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded-lg">
                                    <UserPlusIcon className="size-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                                >
                                    Edit profile
                                </button>
                                <button className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg font-semibold text-sm">
                                    Share profile
                                </button>
                                <button className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded-lg">
                                    <UserPlusIcon className="size-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Highlights Section - Only show "New" */}
                    <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
                        {/* New Highlight */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="size-16 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center bg-transparent">
                                <PlusIcon className="size-6 text-slate-500" />
                            </div>
                            <p className="text-xs text-white text-center mt-2">New</p>
                        </div>

                        {/* Sample highlight for demo - can be replaced with real data */}
                        {displayUser?.bio && (
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="size-16 rounded-full border-2 border-orange-500 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                                        <span className="text-white text-lg">🎓</span>
                                    </div>
                                </div>
                                <p className="text-xs text-white text-center mt-2 truncate w-16">college memories</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="border-t border-slate-800">
                    <div className="flex">
                        <button
                            onClick={() => setProfileTab("posts")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "posts"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <GridIcon className="size-5" />
                        </button>
                        <button
                            onClick={() => setProfileTab("reels")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "reels"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <PlayIcon className="size-5" />
                        </button>
                        <button
                            onClick={() => setProfileTab("tagged")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "tagged"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <BookmarkIcon className="size-5" />
                        </button>
                        <button
                            onClick={() => setProfileTab("contact")}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${profileTab === "contact"
                                ? "text-white border-t-2 border-white"
                                : "text-slate-400"
                                }`}
                        >
                            <UserIcon className="size-5" />
                        </button>
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
                                        <div className="col-span-3 text-center py-16 px-4">
                                            {/* Android-style illustration */}
                                            <div className="mx-auto mb-8 relative">
                                                <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
                                                    {/* Left hand */}
                                                    <path d="M20 50 Q30 30, 50 35 Q70 40, 80 55 Q85 65, 80 75 Q70 85, 50 80 Q30 75, 20 50Z" 
                                                          fill="#D4A574" stroke="#C4956A" strokeWidth="2"/>
                                                    
                                                    {/* Right hand */}
                                                    <path d="M180 50 Q170 30, 150 35 Q130 40, 120 55 Q115 65, 120 75 Q130 85, 150 80 Q170 75, 180 50Z" 
                                                          fill="#D4A574" stroke="#C4956A" strokeWidth="2"/>
                                                    
                                                    {/* Heart shape formed by hands */}
                                                    <path d="M80 60 Q100 40, 120 60 Q100 80, 80 60Z" 
                                                          fill="none" stroke="#E91E63" strokeWidth="3" strokeDasharray="5,5">
                                                        <animate attributeName="stroke-dashoffset" values="10;0;10" dur="2s" repeatCount="indefinite"/>
                                                    </path>
                                                    
                                                    {/* Fingers details */}
                                                    <ellipse cx="45" cy="45" rx="8" ry="12" fill="#D4A574" stroke="#C4956A" strokeWidth="1"/>
                                                    <ellipse cx="155" cy="45" rx="8" ry="12" fill="#D4A574" stroke="#C4956A" strokeWidth="1"/>
                                                    
                                                    {/* Sparkles */}
                                                    <g fill="#FFD700">
                                                        <circle cx="60" cy="30" r="2">
                                                            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0s"/>
                                                        </circle>
                                                        <circle cx="140" cy="25" r="2">
                                                            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
                                                        </circle>
                                                        <circle cx="100" cy="20" r="2">
                                                            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="1s"/>
                                                        </circle>
                                                    </g>
                                                </svg>
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                No Posts Yet
                                            </h3>
                                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                                Start capturing and sharing your moments
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
        </div>
    );
};

export default ProfilePage;