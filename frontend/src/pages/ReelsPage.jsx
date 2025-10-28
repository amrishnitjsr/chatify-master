import { useState } from "react";
import { PlayIcon, PauseIcon, VolumeXIcon, Volume2Icon, HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon, MoreHorizontalIcon } from "lucide-react";

const ReelsPage = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // Mock reels data - you can replace this with real data from your store
    const mockReels = [
        {
            id: 1,
            author: {
                fullName: "John Doe",
                username: "johndoe",
                profilePic: "/avatar.png"
            },
            videoUrl: null, // For now, we'll show placeholder
            description: "Amazing sunset at the beach! 🌅 #sunset #beach #nature",
            likes: 1234,
            comments: 89,
            shares: 45,
            music: "Original Audio"
        },
        {
            id: 2,
            author: {
                fullName: "Jane Smith",
                username: "janesmith",
                profilePic: "/avatar.png"
            },
            videoUrl: null,
            description: "Cooking my favorite pasta recipe 🍝 #cooking #food #italian",
            likes: 856,
            comments: 67,
            shares: 23,
            music: "Cooking Vibes - Kitchen Sounds"
        }
    ];

    return (
        <div className="h-full bg-black overflow-hidden relative">
            {/* Reels Container */}
            <div className="h-full flex items-center justify-center">
                {/* Main Reel Display */}
                <div className="relative w-full max-w-md h-full bg-slate-900 flex items-center justify-center">
                    {/* Video Placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-white text-lg mb-2">Reels Coming Soon!</p>
                            <p className="text-slate-400 text-sm">Video content will be available here</p>
                        </div>

                        {/* Play/Pause Overlay */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                        >
                            {isPlaying ? (
                                <PauseIcon className="size-16 text-white" />
                            ) : (
                                <PlayIcon className="size-16 text-white" />
                            )}
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                        {/* Author Profile */}
                        <div className="text-center">
                            <div className="relative mb-2">
                                <img
                                    src={mockReels[0].author.profilePic}
                                    alt={mockReels[0].author.fullName}
                                    className="size-12 rounded-full border-2 border-white object-cover"
                                />
                                <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Like Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <HeartIcon className="size-7 text-white" />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {mockReels[0].likes}
                            </p>
                        </div>

                        {/* Comment Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <MessageCircleIcon className="size-7 text-white" />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {mockReels[0].comments}
                            </p>
                        </div>

                        {/* Share Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <ShareIcon className="size-7 text-white" />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {mockReels[0].shares}
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <BookmarkIcon className="size-7 text-white" />
                            </button>
                        </div>

                        {/* More Options */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <MoreHorizontalIcon className="size-7 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-4 left-4 right-20 text-white">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold">@{mockReels[0].author.username}</span>
                            <button className="px-3 py-1 border border-white text-xs font-semibold rounded">
                                Follow
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-3 line-clamp-2">
                            {mockReels[0].description}
                        </p>

                        {/* Music Info */}
                        <div className="flex items-center gap-2">
                            <div className="size-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm animate-spin"></div>
                            <span className="text-xs">♪ {mockReels[0].music}</span>
                        </div>
                    </div>

                    {/* Top Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
                        >
                            {isMuted ? (
                                <VolumeXIcon className="size-5 text-white" />
                            ) : (
                                <Volume2Icon className="size-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {mockReels.map((_, index) => (
                    <button
                        key={index}
                        className={`w-1 h-6 rounded-full transition-colors ${index === 0 ? 'bg-white' : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {/* Coming Soon Banner */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">🚀 Reels Coming Soon!</span>
            </div>
        </div>
    );
};

export default ReelsPage;