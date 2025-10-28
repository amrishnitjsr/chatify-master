import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFollowStore } from "../store/useFollowStore";

const SuggestedUsers = ({ onUserClick }) => {
    const { onlineUsers } = useAuthStore();
    const {
        suggestedUsers,
        fetchSuggestedUsers,
        toggleFollow,
        isFollowing,
        isLoadingSuggested,
        isToggling
    } = useFollowStore();

    useEffect(() => {
        fetchSuggestedUsers();
    }, [fetchSuggestedUsers]);

    const handleFollow = async (userId) => {
        await toggleFollow(userId);
    };

    if (isLoadingSuggested) {
        return (
            <div className="w-80 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-32 mb-4"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <div className="size-12 bg-slate-700 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-slate-700 rounded w-20 mb-1"></div>
                                <div className="h-2 bg-slate-700 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Suggested for you</h3>
                <button className="text-slate-400 hover:text-white text-sm transition-colors">
                    See All
                </button>
            </div>

            {/* User List */}
            <div className="space-y-3">
                {suggestedUsers.map((user) => (
                    <div key={user._id} className="flex items-center gap-3">
                        {/* Profile Picture with Online Indicator - Clickable */}
                        <div
                            className="relative cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onUserClick && onUserClick(user._id)}
                        >
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="size-12 rounded-full object-cover border border-slate-600"
                            />
                            {onlineUsers?.includes(user._id) && (
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                            )}
                        </div>

                        {/* User Info - Clickable */}
                        <div
                            className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onUserClick && onUserClick(user._id)}
                        >
                            <h4 className="text-white font-medium text-sm truncate">
                                {user.fullName}
                            </h4>
                            <p className="text-slate-400 text-xs">
                                {onlineUsers?.includes(user._id) ? (
                                    <span className="text-green-400">● Active now</span>
                                ) : (
                                    "Suggested for you"
                                )}
                            </p>
                        </div>

                        {/* Follow Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(user._id);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFollowing(user._id)
                                ? "bg-slate-600 text-slate-300 hover:bg-slate-500"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            disabled={isToggling}
                        >
                            {isToggling ? "..." : isFollowing(user._id) ? "Following" : "Follow"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
                <div className="text-slate-500 text-xs space-y-1">
                    <div className="flex flex-wrap gap-1">
                        <span>About ·</span>
                        <span>Help ·</span>
                        <span>Press ·</span>
                        <span>API ·</span>
                        <span>Jobs ·</span>
                        <span>Privacy ·</span>
                        <span>Terms</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        <span>Locations ·</span>
                        <span>Language ·</span>
                        <span>Meta Verified</span>
                    </div>
                    <div className="mt-2">
                        © 2025 CHATIFY FROM META
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuggestedUsers;