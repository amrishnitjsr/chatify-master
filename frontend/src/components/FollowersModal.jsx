import { useEffect, useState } from "react";
import { X, UserIcon } from "lucide-react";
import { useFollowStore } from "../store/useFollowStore";

const FollowersModal = ({ isOpen, onClose, userId }) => {
    const { fetchFollowers, fetchFollowing, followers, following, isLoadingFollowers, isLoadingFollowing } = useFollowStore();

    const [activeTab, setActiveTab] = useState("followers");
    const isFollowersTab = activeTab === "followers";
    const currentList = isFollowersTab ? followers : following;
    const isLoading = isFollowersTab ? isLoadingFollowers : isLoadingFollowing;

    useEffect(() => {
        if (isOpen && userId) {
            if (isFollowersTab) {
                fetchFollowers(userId);
            } else {
                fetchFollowing(userId);
            }
        }
    }, [isOpen, userId, activeTab, fetchFollowers, fetchFollowing, isFollowersTab]);

    const handleUserClick = (clickedUserId) => {
        window.location.href = `/profile/${clickedUserId}`;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "followers"
                                    ? "text-white border-white"
                                    : "text-slate-400 border-transparent hover:text-slate-300"
                                }`}
                        >
                            Followers
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "following"
                                    ? "text-white border-white"
                                    : "text-slate-400 border-transparent hover:text-slate-300"
                                }`}
                        >
                            Following
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="size-12 bg-slate-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-700 rounded w-24 mb-1"></div>
                                        <div className="h-3 bg-slate-700 rounded w-32"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentList.length === 0 ? (
                        <div className="p-8 text-center">
                            <UserIcon className="size-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">
                                {isFollowersTab ? "No followers yet" : "Not following anyone yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {currentList.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserClick(user._id)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                                >
                                    {/* Profile Image */}
                                    <div className="size-12 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                                        {user.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={user.fullName}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="size-6 text-slate-400" />
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {user.fullName}
                                        </p>
                                        <p className="text-slate-400 text-sm truncate">
                                            @{user.fullName?.toLowerCase().replace(/\s+/g, '') || user.email}
                                        </p>
                                    </div>

                                    {/* Online Status */}
                                    <div className="size-2 bg-green-500 rounded-full opacity-60"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowersModal;