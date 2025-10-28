import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function CompactChatContainer() {
    const {
        selectedUser,
        getMessagesByUserId,
        messages,
        isMessagesLoading,
        subscribeToMessages,
        unsubscribeFromMessages,
        sendMessage,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (selectedUser?._id) {
            getMessagesByUserId(selectedUser._id);
            subscribeToMessages();
        }

        return () => unsubscribeFromMessages();
    }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage({
                text: newMessage.trim(),
                image: null,
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (!selectedUser) return null;

    return (
        <>
            {/* Messages Area */}
            <div className="flex-1 p-3 overflow-y-auto">
                {messages.length > 0 && !isMessagesLoading ? (
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.senderId === authUser._id ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-3 py-2 ${msg.senderId === authUser._id
                                            ? "bg-blue-500 text-white"
                                            : "bg-slate-700 text-slate-200"
                                        }`}
                                >
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="Shared"
                                            className="rounded-lg max-w-full h-auto mb-1"
                                        />
                                    )}
                                    {msg.text && (
                                        <p className="text-sm break-words">{msg.text}</p>
                                    )}
                                    <p className="text-xs mt-1 opacity-75">
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                ) : isMessagesLoading ? (
                    <MessagesLoadingSkeleton />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-400 text-sm">
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Say hello to {selectedUser.fullName}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-slate-700/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="text-blue-500 hover:text-blue-400 disabled:text-slate-600 p-2 transition-colors"
                    >
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
}

export default CompactChatContainer;