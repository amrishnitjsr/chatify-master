import { useState, useEffect } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import Comment from "./Comment";
import { SendIcon } from "lucide-react";

const CommentSection = ({ postId, onClose }) => {
    const [newComment, setNewComment] = useState("");
    const {
        fetchComments,
        addComment,
        getCommentsForPost,
        isLoadingComments,
        isAddingComment
    } = usePostStore();

    const { authUser } = useAuthStore();
    const comments = getCommentsForPost(postId);

    useEffect(() => {
        // Fetch comments when component mounts
        fetchComments(postId);
    }, [fetchComments, postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            await addComment(postId, newComment.trim());
            setNewComment("");
        } catch (error) {
            console.error('Add comment error:', error);
        }
    };

    return (
        <div className="p-6">
            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex items-start gap-3">
                    <img
                        src={authUser?.profilePic || "/avatar.png"}
                        alt={authUser?.fullName}
                        className="size-8 rounded-full object-cover border border-slate-600"
                    />
                    <div className="flex-1">
                        <div className="flex">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                maxLength={1000}
                                className="flex-1 bg-slate-700/50 text-white placeholder-slate-400 rounded-l-lg px-4 py-2 border border-slate-600 focus:border-primary focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isAddingComment || !newComment.trim()}
                                className="bg-primary hover:bg-primary/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-r-lg border border-primary border-l-0 transition-colors"
                            >
                                {isAddingComment ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <SendIcon className="size-4" />
                                )}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <span className={`text-xs ${newComment.length > 900 ? 'text-warning' : 'text-slate-400'}`}>
                                {newComment.length}/1000
                            </span>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {isLoadingComments ? (
                    <div className="text-center py-4">
                        <span className="loading loading-spinner loading-sm text-slate-400"></span>
                        <p className="text-slate-400 text-sm mt-2">Loading comments...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            comment={comment}
                            postId={postId}
                        />
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">💬</div>
                        <p className="text-slate-400 text-sm">No comments yet</p>
                        <p className="text-slate-500 text-xs">Be the first to comment!</p>
                    </div>
                )}
            </div>

            {/* Close button for mobile */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 sm:hidden">
                <button
                    onClick={onClose}
                    className="w-full btn btn-ghost btn-sm text-slate-400"
                >
                    Hide Comments
                </button>
            </div>
        </div>
    );
};

export default CommentSection;