import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Send, MoreHorizontal } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";
import { useAuthStore } from "../store/useAuthStore";

const StoryViewer = () => {
    const { authUser } = useAuthStore();
    const {
        currentStoryGroup,
        currentStoryIndex,
        isViewingStory,
        closeStoryViewer,
        nextStory,
        previousStory,
        nextStoryGroup,
        previousStoryGroup,
        viewStory,
        deleteStory,

    } = useStoryStore();

    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const timeoutRef = useRef(null);

    const currentStory = currentStoryGroup?.stories?.[currentStoryIndex];
    const isOwnStory = currentStory?.userId._id === authUser?._id;

    // Story auto-progression timer
    useEffect(() => {
        if (!currentStory || isPaused) return;

        const duration = currentStory.contentType === "video" ? 10000 : 5000; // 10s for video, 5s for image/text
        const interval = 50; // Update progress every 50ms

        timeoutRef.current = setTimeout(() => {
            if (!nextStory()) {
                if (!nextStoryGroup()) {
                    closeStoryViewer();
                }
            }
        }, duration);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + (100 * interval) / duration;
                return newProgress >= 100 ? 100 : newProgress;
            });
        }, interval);

        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(progressInterval);
        };
    }, [currentStory, isPaused, nextStory, nextStoryGroup, closeStoryViewer]);

    // Reset progress when story changes
    useEffect(() => {
        setProgress(0);
        if (currentStory && !isOwnStory) {
            viewStory(currentStory._id);
        }
    }, [currentStoryIndex, currentStoryGroup, currentStory, isOwnStory, viewStory]);

    const handlePrevious = useCallback(() => {
        if (!previousStory()) {
            previousStoryGroup();
        }
    }, [previousStory, previousStoryGroup]);

    const handleNext = useCallback(() => {
        if (!nextStory()) {
            if (!nextStoryGroup()) {
                closeStoryViewer();
            }
        }
    }, [nextStory, nextStoryGroup, closeStoryViewer]);

    const handleDeleteStory = async () => {
        if (currentStory && isOwnStory) {
            try {
                await deleteStory(currentStory._id);
                setShowOptions(false);

                // Move to next story or close viewer
                if (!nextStory()) {
                    if (!nextStoryGroup()) {
                        closeStoryViewer();
                    }
                }
            } catch (error) {
                console.error("Failed to delete story:", error);
            }
        }
    };

    const handleKeyPress = useCallback((e) => {
        if (e.key === "ArrowLeft") handlePrevious();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "Escape") closeStoryViewer();
        if (e.key === " ") {
            e.preventDefault();
            setIsPaused(!isPaused);
        }
    }, [isPaused, closeStoryViewer, handleNext, handlePrevious]);

    useEffect(() => {
        if (isViewingStory) {
            window.addEventListener("keydown", handleKeyPress);
            return () => window.removeEventListener("keydown", handleKeyPress);
        }
    }, [isViewingStory, handleKeyPress]);

    if (!isViewingStory || !currentStoryGroup || !currentStory) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                {currentStoryGroup.stories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100"
                            style={{
                                width: index < currentStoryIndex ? "100%" :
                                    index === currentStoryIndex ? `${progress}%` : "0%"
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10 mt-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        {currentStoryGroup.user.profilePic ? (
                            <img
                                src={currentStoryGroup.user.profilePic}
                                alt={currentStoryGroup.user.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {currentStoryGroup.user.fullName?.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">
                            {currentStoryGroup.user.fullName}
                        </p>
                        <p className="text-white/70 text-xs">
                            {new Date(currentStory.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isOwnStory && (
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <MoreHorizontal className="size-6" />
                        </button>
                    )}
                    <button
                        onClick={closeStoryViewer}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <X className="size-6" />
                    </button>
                </div>
            </div>

            {/* Options Menu */}
            {showOptions && isOwnStory && (
                <div className="absolute top-20 right-4 bg-slate-800 rounded-lg shadow-xl z-20 min-w-32">
                    <button
                        onClick={handleDeleteStory}
                        className="w-full px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                    >
                        Delete Story
                    </button>
                </div>
            )}

            {/* Story Content */}
            <div
                className="relative w-full h-full max-w-md mx-auto bg-black flex items-center justify-center"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {currentStory.contentType === "text" ? (
                    <div
                        className="w-full h-full flex items-center justify-center p-8"
                        style={{ backgroundColor: currentStory.backgroundColor }}
                    >
                        <p className="text-white text-center text-2xl font-semibold leading-relaxed">
                            {currentStory.text}
                        </p>
                    </div>
                ) : currentStory.contentType === "video" ? (
                    <video
                        src={currentStory.content}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        onEnded={handleNext}
                    />
                ) : (
                    <div className="w-full h-full relative">
                        <img
                            src={currentStory.content}
                            alt="Story content"
                            className="w-full h-full object-contain"
                        />
                        {currentStory.text && (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p
                                    className="text-white text-center font-semibold text-xl"
                                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                                >
                                    {currentStory.text}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Areas */}
                <button
                    onClick={handlePrevious}
                    className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-start pl-4 text-white/50 hover:text-white/70 transition-colors"
                >
                    <ChevronLeft className="size-8" />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-0 top-0 w-1/3 h-full flex items-center justify-end pr-4 text-white/50 hover:text-white/70 transition-colors"
                >
                    <ChevronRight className="size-8" />
                </button>
            </div>

            {/* Bottom Actions (for other users' stories) */}
            {!isOwnStory && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-10">
                    <div className="flex-1 bg-white/10 rounded-full px-4 py-2">
                        <input
                            type="text"
                            placeholder="Reply to story..."
                            className="bg-transparent text-white placeholder-white/60 outline-none w-full"
                        />
                    </div>
                    <button className="text-white/70 hover:text-white transition-colors">
                        <Heart className="size-6" />
                    </button>
                    <button className="text-white/70 hover:text-white transition-colors">
                        <Send className="size-6" />
                    </button>
                </div>
            )}

            {/* Paused Indicator */}
            {isPaused && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3">
                    <div className="w-2 h-8 bg-white rounded mx-1 inline-block"></div>
                    <div className="w-2 h-8 bg-white rounded mx-1 inline-block"></div>
                </div>
            )}
        </div>
    );
};

export default StoryViewer;