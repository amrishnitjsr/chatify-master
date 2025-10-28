import { useState } from "react";
import { PlusIcon, PlayIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const StoriesSection = () => {
    const { authUser } = useAuthStore();
    const [_stories, _setStories] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock stories data - you can replace with real data later
    const mockStories = [
        {
            id: 1,
            user: {
                _id: "user1",
                fullName: "John Doe",
                profilePic: "/avatar.png"
            },
            thumbnail: "/avatar.png",
            isViewed: false
        },
        {
            id: 2,
            user: {
                _id: "user2",
                fullName: "Jane Smith",
                profilePic: "/avatar.png"
            },
            thumbnail: "/avatar.png",
            isViewed: true
        },
        {
            id: 3,
            user: {
                _id: "user3",
                fullName: "Mike Johnson",
                profilePic: "/avatar.png"
            },
            thumbnail: "/avatar.png",
            isViewed: false
        }
    ];

    const handleCreateStory = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Here you would upload the story
            console.log("Story file selected:", file);
            setShowCreateModal(false);
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
                    {mockStories.map((story) => (
                        <div key={story.id} className="flex-shrink-0">
                            <div className="relative">
                                <button className="relative block group">
                                    <div className={`w-16 h-16 rounded-full p-0.5 ${story.isViewed
                                            ? 'bg-gradient-to-tr from-slate-500 to-slate-400'
                                            : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                                        }`}>
                                        <div className="w-full h-full rounded-full border-2 border-slate-900 overflow-hidden">
                                            <img
                                                src={story.user.profilePic}
                                                alt={story.user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    {/* Play icon overlay on hover */}
                                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <PlayIcon className="w-6 h-6 text-white" />
                                    </div>
                                </button>
                                <p className="text-xs text-white text-center mt-1 truncate w-16">
                                    {story.user.fullName.split(' ')[0]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Story Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-white mb-2">Create story</h2>
                            <p className="text-slate-400 text-sm">Share a photo or video that disappears after 24 hours</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="w-full p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors cursor-pointer text-center">
                                    <div className="text-4xl mb-3">📷</div>
                                    <p className="text-white font-medium">Select photo or video</p>
                                    <p className="text-slate-400 text-sm mt-1">or drag and drop</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoriesSection;