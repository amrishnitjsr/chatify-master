import { useState } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { ReplyIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Comment = ({ comment, postId }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { addComment, isAddingComment } = usePostStore();
    const { authUser } = useAuthStore();

    const isOwnComment = authUser?._id === comment.userId._id;

    const handleReply = async (e) => {
        e.preventDefault();

        if (!replyText.trim()) return;

        try {
            await addComment(postId, replyText.trim(), comment._id);
            setReplyText("");
            setShowReplyForm(false);
            setShowReplies(true); // Show replies after adding one
        } catch (error) {
            console.error('Add reply error:', error);
        }
    };

    const formatTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'some time ago';
        }
    };

    return (
        <div className="space-y-3">
            {/* Main Comment */}
            <div className="flex gap-3">
                <img
                    src={comment.userId.profilePic || "/avatar.png"}
                    alt={comment.userId.fullName}
                    className="size-8 rounded-full object-cover border border-slate-600"
                />

                <div className="flex-1 min-w-0">
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium text-sm">
                                {comment.userId.fullName}
                            </h4>

                            {isOwnComment && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="text-slate-400 hover:text-white p-1"
                                    >
                                        <MoreVerticalIcon className="size-3" />
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 top-6 bg-slate-600 rounded-lg shadow-lg border border-slate-500 py-1 z-10 min-w-[100px]">
                                            <button className="w-full px-3 py-1 text-left text-red-400 hover:bg-slate-500 transition-colors flex items-center gap-2 text-sm">
                                                <TrashIcon className="size-3" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-slate-200 text-sm leading-relaxed">
                            {comment.text}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{formatTimeAgo(comment.createdAt)}</span>

                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                        >
                            <ReplyIcon className="size-3" />
                            Reply
                        </button>

                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="hover:text-slate-200 transition-colors"
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <div className="ml-11">
                    <form onSubmit={handleReply} className="flex gap-2">
                        <img
                            src={authUser?.profilePic || "/avatar.png"}
                            alt={authUser?.fullName}
                            className="size-6 rounded-full object-cover border border-slate-600"
                        />
                        <div className="flex-1">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.userId.fullName}...`}
                                maxLength={1000}
                                className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:border-primary focus:outline-none"
                                autoFocus
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs ${replyText.length > 900 ? 'text-warning' : 'text-slate-400'}`}>
                                    {replyText.length}/1000
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReplyForm(false);
                                            setReplyText("");
                                        }}
                                        className="text-slate-400 hover:text-white text-xs px-2 py-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAddingComment || !replyText.trim()}
                                        className="bg-primary hover:bg-primary/80 disabled:bg-slate-600 text-white text-xs px-3 py-1 rounded transition-colors"
                                    >
                                        {isAddingComment ? 'Replying...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-3 border-l-2 border-slate-700/50 pl-3">
                    {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                            <img
                                src={reply.userId.profilePic || "/avatar.png"}
                                alt={reply.userId.fullName}
                                className="size-6 rounded-full object-cover border border-slate-600"
                            />

                            <div className="flex-1">
                                <div className="bg-slate-700/30 rounded-lg px-3 py-2">
                                    <h5 className="text-white font-medium text-sm mb-1">
                                        {reply.userId.fullName}
                                    </h5>
                                    <p className="text-slate-200 text-sm">
                                        {reply.text}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formatTimeAgo(reply.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
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

export default Comment;