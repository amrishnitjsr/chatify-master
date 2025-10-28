import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, VolumeXIcon, Volume2Icon, HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon, MoreHorizontalIcon, UserPlusIcon } from "lucide-react";

const ReelsPage = () => {
    const [currentReel, setCurrentReel] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [likedReels, setLikedReels] = useState(new Set());
    const videoRef = useRef(null);

    // Chatify-style sample reels data
    const sampleReels = [
        {
            id: 1,
            author: {
                fullName: "Emma Wilson",
                username: "emmaw_photography",
                profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b2ad?w=150&h=150&fit=crop&crop=face&auto=format",
                isFollowing: false
            },
            thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&auto=format",
            description: "Golden hour magic ✨ The way light dances through nature never fails to amaze me! 📸 #photography #goldenhour #nature",
            likes: 12847,
            comments: 234,
            shares: 89,
            music: "Aesthetic Vibes - Lofi Mix"
        },
        {
            id: 2,
            author: {
                fullName: "Alex Chen",
                username: "alexchen_chef",
                profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
                isFollowing: true
            },
            thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop&auto=format",
            description: "Perfect pasta carbonara in 60 seconds! 🍝👨‍🍳 The secret is timing and fresh eggs! #cooking #pasta #recipe #chef",
            likes: 8924,
            comments: 167,
            shares: 245,
            music: "Kitchen Beats - Cooking Vibes"
        },
        {
            id: 3,
            author: {
                fullName: "Maya Singh",
                username: "maya_travels",
                profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
                isFollowing: false
            },
            thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop&auto=format",
            description: "Hiking through the Swiss Alps! Every step was worth this view �️⛰️ #travel #hiking #switzerland #mountains",
            likes: 15632,
            comments: 389,
            shares: 156,
            music: "Adventure Sounds - Mountain Echoes"
        }
    ];

    const currentReelData = sampleReels[currentReel];

    // Handle interactions
    const toggleLike = () => {
        setLikedReels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentReelData.id)) {
                newSet.delete(currentReelData.id);
            } else {
                newSet.add(currentReelData.id);
            }
            return newSet;
        });
    };

    const handleSwipe = (direction) => {
        if (direction === 'up' && currentReel < sampleReels.length - 1) {
            setCurrentReel(prev => prev + 1);
        } else if (direction === 'down' && currentReel > 0) {
            setCurrentReel(prev => prev - 1);
        }
    };

    // Format numbers for display
    const formatCount = (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    };

    return (
        <div className="h-full bg-black overflow-hidden relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                <h1 className="text-white text-lg font-semibold">Reels</h1>
                <button className="text-white p-2">
                    <MoreHorizontalIcon className="size-6" />
                </button>
            </div>

            {/* Reels Container */}
            <div className="h-full flex items-center justify-center">
                {/* Main Reel Display */}
                <div className="relative w-full max-w-md h-full bg-slate-900 flex items-center justify-center">
                    {/* Reel Content */}
                    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                        <img
                            src={currentReelData.thumbnail}
                            alt="Reel content"
                            className="w-full h-full object-cover"
                        />

                        {/* Play/Pause Overlay */}
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {!isPlaying && (
                                <div className="bg-black/50 rounded-full p-6">
                                    <PlayIcon className="size-16 text-white fill-white" />
                                </div>
                            )}
                        </div>

                        {/* Swipe areas for navigation */}
                        {currentReel > 0 && (
                            <div
                                className="absolute top-0 left-0 right-0 h-1/3 cursor-pointer"
                                onClick={() => handleSwipe('down')}
                            />
                        )}
                        {currentReel < sampleReels.length - 1 && (
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1/3 cursor-pointer"
                                onClick={() => handleSwipe('up')}
                            />
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                        {/* Author Profile */}
                        <div className="text-center">
                            <div className="relative mb-2">
                                <img
                                    src={currentReelData.author.profilePic}
                                    alt={currentReelData.author.fullName}
                                    className="size-12 rounded-full border-2 border-white object-cover"
                                />
                                {!currentReelData.author.isFollowing && (
                                    <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        +
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Like Button */}
                        <div className="text-center">
                            <button onClick={toggleLike} className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <HeartIcon className={`size-7 ${likedReels.has(currentReelData.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {formatCount(currentReelData.likes + (likedReels.has(currentReelData.id) ? 1 : 0))}
                            </p>
                        </div>

                        {/* Comment Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <MessageCircleIcon className="size-7 text-white" />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {formatCount(currentReelData.comments)}
                            </p>
                        </div>

                        {/* Share Button */}
                        <div className="text-center">
                            <button className="p-3 rounded-full hover:bg-white/10 transition-colors">
                                <ShareIcon className="size-7 text-white" />
                            </button>
                            <p className="text-white text-xs font-medium mt-1">
                                {formatCount(currentReelData.shares)}
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
                            <span className="font-semibold">@{currentReelData.author.username}</span>
                            {!currentReelData.author.isFollowing && (
                                <button className="px-3 py-1 border border-white text-xs font-semibold rounded">
                                    Follow
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-3 line-clamp-2">
                            {currentReelData.description}
                        </p>

                        {/* Music Info */}
                        <div className="flex items-center gap-2">
                            <div className="size-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm animate-spin"></div>
                            <span className="text-xs">♪ {currentReelData.music}</span>
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
                {sampleReels.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentReel(index)}
                        className={`w-1 h-6 rounded-full transition-colors ${index === currentReel ? 'bg-white' : 'bg-white/40'
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