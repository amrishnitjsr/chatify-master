import { useState, useEffect } from "react";
import { PlusIcon, PlayIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useStoryStore } from "../store/useStoryStore";
import CreateStoryModal from "./CreateStoryModal";

const StoriesSection = () => {
    const { authUser } = useAuthStore();
    const { stories, fetchStories, isLoadingStories, setCurrentStoryGroup } = useStoryStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    console.log("Stories in StoriesSection:", stories);

    const handleCreateStory = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleDebugStories = async () => {
        try {
            console.log("🔍 Debugging stories...");
            const response = await fetch('/api/stories/debug/all', {
                credentials: 'include'
            });
            const data = await response.json();
            console.log("🔍 DEBUG - All stories in database:", data);
        } catch (error) {
            console.error("❌ Debug fetch error:", error);
        }
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Your Story */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={handleCreateStory}
                                className="relative block"
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-700 flex items-center justify-center">
                                    {authUser?.profilePic ? (
                                        <img
                                            src={authUser.profilePic}
                                            alt="Your story"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                            <PlusIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                    <PlusIcon className="w-3 h-3 text-white" />
                                </div>
                            </button>
                            <p className="text-xs text-white text-center mt-1 truncate w-16">Your story</p>
                        </div>
                    </div>

                    {/* Other Stories */}
                    {isLoadingStories ? (
                        // Loading skeleton
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse"></div>
                                <div className="h-3 bg-slate-700 rounded w-12 mt-1 mx-auto animate-pulse"></div>
                            </div>
                        ))
                    ) : (
                        stories.map((storyGroup) => (
                            <div key={storyGroup._id} className="flex-shrink-0">
                                <div className="relative">
                                    <button
                                        className="relative block group"
                                        onClick={() => setCurrentStoryGroup(storyGroup)}
                                    >
                                        <div className={`w-16 h-16 rounded-full p-0.5 ${storyGroup.hasUnseenStories
                                            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                                            : 'bg-gradient-to-tr from-slate-500 to-slate-400'
                                            }`}>
                                            <div className="w-full h-full rounded-full border-2 border-slate-900 overflow-hidden">
                                                {storyGroup.user.profilePic ? (
                                                    <img
                                                        src={storyGroup.user.profilePic}
                                                        alt={storyGroup.user.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                                        <span className="text-white font-medium text-lg">
                                                            {storyGroup.user.fullName?.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Play icon overlay on hover */}
                                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <PlayIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </button>
                                    <p className="text-xs text-white text-center mt-1 truncate w-16">
                                        {storyGroup.user.fullName?.split(' ')[0]}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Debug Info */}
            <div className="mb-4 p-2 bg-slate-800/50 rounded text-xs text-slate-400">
                Stories loaded: {stories.length} |
                <button
                    onClick={handleDebugStories}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                >
                    Debug All Stories
                </button>
            </div>

            <CreateStoryModal
                isOpen={showCreateModal}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default StoriesSection;