import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Smile } from "lucide-react";
import CategoryEmojiPicker from "./CategoryEmojiPicker";

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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

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
        const messageText = newMessage.trim();
        if (!messageText) return;

        // Clear input immediately for better UX
        setNewMessage("");
        
        // Close emoji picker if open
        setShowEmojiPicker(false);

        try {
            await sendMessage({
                text: messageText,
                image: null,
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            // Restore message on error
            setNewMessage(messageText);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prev => !prev);
    };

    const closeEmojiPicker = () => {
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };



    if (!selectedUser) return null;

    return (
        <div className="flex flex-col h-full bg-black md:bg-slate-900">
            {/* Messages Area - Optimized for Android */}
            <div className="flex-1 p-4 pb-2 overflow-y-auto touch-pan-y overscroll-contain bg-black md:bg-transparent">
                {messages.length > 0 && !isMessagesLoading ? (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.senderId === authUser._id ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${msg.senderId === authUser._id
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                        : "bg-slate-700 text-slate-100 border border-slate-600/50"
                                        }`}
                                >
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="Shared"
                                            className="rounded-xl max-w-full h-auto mb-2 border border-black/10"
                                        />
                                    )}
                                    {msg.text && (
                                        <p className="text-sm break-words leading-relaxed font-medium">{msg.text}</p>
                                    )}
                                    <p className={`text-xs mt-2 ${msg.senderId === authUser._id ? 'opacity-80' : 'opacity-70'}`}>
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
                        <div className="text-center text-slate-400">
                            <div className="mb-4">
                                <div className="size-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                                    <svg className="size-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-lg font-medium mb-1">No messages yet</p>
                            <p className="text-sm opacity-75">Start a conversation with {selectedUser.fullName}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Message Input - Simple Style */}
            <div className="p-4 pt-2 border-t border-slate-700/50 bg-black md:bg-slate-800/50 backdrop-blur-sm relative">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-slate-700/80 border border-slate-600/50 rounded-3xl px-6 py-3 pr-12 text-white placeholder-slate-400 text-base focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all resize-none min-h-[48px] leading-relaxed"
                            style={{ fontSize: '16px' }} // Prevents zoom on iOS
                        />

                        {/* Emoji Picker Button */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                            <button
                                type="button"
                                onClick={toggleEmojiPicker}
                                className={`p-2 rounded-full transition-colors ${showEmojiPicker
                                    ? 'text-blue-400 bg-slate-600'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-600'
                                    }`}
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                            {/* Mobile Backdrop */}
                            {showEmojiPicker && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden" onClick={closeEmojiPicker} />
                            )}

                            {showEmojiPicker && (
                                <CategoryEmojiPicker
                                    isOpen={showEmojiPicker}
                                    onEmojiSelect={handleEmojiSelect}
                                    onClose={closeEmojiPicker}
                                />
                            )}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full touch-manipulation transition-all duration-200 ${newMessage.trim()
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CompactChatContainer;