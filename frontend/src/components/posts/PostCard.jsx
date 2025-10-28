import { useState } from "react";
import { Link } from "react-router";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { HeartIcon, MessageCircleIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "../comments/CommentSection";

const PostCard = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { toggleLike, deletePost } = usePostStore();
    const { authUser } = useAuthStore(); const isOwnPost = authUser?._id === post.userId._id;

    const handleLike = () => {
        toggleLike(post._id);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost(post._id);
        }
        setShowMenu(false);
    };

    const formatTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'some time ago';
        }
    };

    return (
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-200">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        to={`/profile/${post.userId._id}`}
                        className="flex items-center gap-3 hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors"
                    >
                        <img
                            src={post.userId.profilePic || "/avatar.png"}
                            alt={post.userId.fullName}
                            className="size-12 rounded-full object-cover border-2 border-slate-600"
                        />
                        <div>
                            <h3 className="text-white font-semibold hover:text-primary transition-colors">
                                {post.userId.fullName}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {formatTimeAgo(post.createdAt)}
                            </p>
                        </div>
                    </Link>

                    {/* Menu */}
                    {isOwnPost && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                            >
                                <MoreVerticalIcon className="size-4" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-10 bg-slate-700 rounded-lg shadow-lg border border-slate-600 py-1 z-10 min-w-[120px]">
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 transition-colors flex items-center gap-2"
                                    >
                                        <TrashIcon className="size-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mb-4">
                    {post.text && (
                        <p className="text-white whitespace-pre-wrap leading-relaxed">
                            {post.text}
                        </p>
                    )}
                </div>
            </div>

            {/* Image */}
            {post.imageUrl && (
                <div className="px-6 pb-4">
                    <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full max-h-96 object-cover rounded-lg border border-slate-700/50"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${post.hasLiked
                                ? 'text-red-500 hover:text-red-400'
                                : 'text-slate-400 hover:text-red-500'
                                }`}
                        >
                            <HeartIcon
                                className={`size-5 ${post.hasLiked ? 'fill-current' : ''}`}
                            />
                            <span className="text-sm font-medium">
                                {post.likeCount || 0}
                            </span>
                        </button>

                        {/* Comment Button */}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircleIcon className="size-5" />
                            <span className="text-sm font-medium">
                                {post.commentCount || 0}
                            </span>
                        </button>
                    </div>

                    {/* Engagement Stats */}
                    <div className="text-slate-400 text-sm">
                        {post.likeCount > 0 && post.commentCount > 0 ? (
                            <>
                                {post.likeCount} like{post.likeCount !== 1 ? 's' : ''} • {' '}
                                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
                            </>
                        ) : post.likeCount > 0 ? (
                            <>
                                {post.likeCount} like{post.likeCount !== 1 ? 's' : ''}
                            </>
                        ) : post.commentCount > 0 ? (
                            <>
                                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
                            </>
                        ) : (
                            'Be the first to interact'
                        )}
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-slate-700/50">
                    <CommentSection
                        postId={post._id}
                        onClose={() => setShowComments(false)}
                    />
                </div>
            )}

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
};

export default PostCard;