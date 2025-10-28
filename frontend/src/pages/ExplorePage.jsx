import { useState, useEffect } from "react";
import { usePostStore } from "../store/usePostStore";
import { HeartIcon, MessageCircleIcon, BookmarkIcon } from "lucide-react";

const ExplorePage = () => {
    const { allPosts, fetchAllPosts, isAllPostsLoading } = usePostStore();
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        fetchAllPosts();
    }, [fetchAllPosts]);

    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    if (isAllPostsLoading) {
        return (
            <div className="h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-semibold text-white">Explore</h1>
                </div>

                {/* Loading Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-1">
                        {[...Array(18)].map((_, i) => (
                            <div key={i} className="aspect-square bg-slate-700/50 animate-pulse rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-semibold text-white">Explore</h1>
                </div>

                {/* Posts Grid */}
                <div className="p-6">
                    {allPosts?.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📷</div>
                            <h2 className="text-xl font-semibold text-white mb-2">No posts to explore</h2>
                            <p className="text-slate-400">When people share posts, you'll see them here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {allPosts?.map((post) => (
                                <div
                                    key={post._id}
                                    onClick={() => handlePostClick(post)}
                                    className="aspect-square bg-slate-700 rounded overflow-hidden relative group cursor-pointer"
                                >
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-700">
                                            <span className="text-slate-300 text-sm p-4 text-center line-clamp-6">
                                                {post.text}
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover overlay with stats */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="flex items-center gap-6 text-white">
                                            <div className="flex items-center gap-2">
                                                <HeartIcon className="size-6 fill-current" />
                                                <span className="font-semibold">{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageCircleIcon className="size-6 fill-current" />
                                                <span className="font-semibold">{post.commentCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex">
                        {/* Post Image/Content */}
                        <div className="flex-1 bg-black flex items-center justify-center">
                            {selectedPost.imageUrl ? (
                                <img
                                    src={selectedPost.imageUrl}
                                    alt="Post"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-white text-lg">{selectedPost.text}</p>
                                </div>
                            )}
                        </div>

                        {/* Post Details Sidebar */}
                        <div className="w-96 border-l border-slate-700 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedPost.author?.profilePic || "/avatar.png"}
                                        alt={selectedPost.author?.fullName}
                                        className="size-8 rounded-full object-cover"
                                    />
                                    <span className="text-white font-semibold">
                                        {selectedPost.author?.fullName}
                                    </span>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-white p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Post Content */}
                            <div className="flex-1 p-4">
                                {selectedPost.text && (
                                    <div className="mb-4">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={selectedPost.author?.profilePic || "/avatar.png"}
                                                alt={selectedPost.author?.fullName}
                                                className="size-8 rounded-full object-cover"
                                            />
                                            <div>
                                                <span className="text-white font-semibold mr-2">
                                                    {selectedPost.author?.fullName}
                                                </span>
                                                <span className="text-white">{selectedPost.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-slate-400 text-xs">
                                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-slate-700">
                                <div className="flex items-center gap-4 mb-3">
                                    <button className="flex items-center gap-2 text-white hover:text-slate-300">
                                        <HeartIcon className="size-6" />
                                    </button>
                                    <button className="flex items-center gap-2 text-white hover:text-slate-300">
                                        <MessageCircleIcon className="size-6" />
                                    </button>
                                    <button className="flex items-center gap-2 text-white hover:text-slate-300 ml-auto">
                                        <BookmarkIcon className="size-6" />
                                    </button>
                                </div>

                                <div className="text-white font-semibold text-sm mb-2">
                                    {selectedPost.likes?.length || 0} likes
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExplorePage;