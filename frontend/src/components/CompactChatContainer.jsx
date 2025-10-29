import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Smile, Camera, Paperclip, Mic, Send, Plus } from "lucide-react";
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
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const emojiPickerRef = useRef(null);
    const attachmentMenuRef = useRef(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
                setShowAttachmentMenu(false);
            }
        };

        if (showEmojiPicker || showAttachmentMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showAttachmentMenu]);

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

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prev => !prev);
    };

    const closeEmojiPicker = () => {
        setShowEmojiPicker(false);
    };

    const toggleAttachmentMenu = () => {
        setShowAttachmentMenu(prev => !prev);
    };

    const handleCameraCapture = () => {
        cameraInputRef.current?.click();
        setShowAttachmentMenu(false);
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
        setShowAttachmentMenu(false);
    };

    const handleVoiceRecording = () => {
        if (isRecording) {
            // Stop recording logic here
            setIsRecording(false);
        } else {
            // Start recording logic here
            setIsRecording(true);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Handle file upload logic here
            console.log('File selected:', file);
        }
    };

    const handleCameraChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Handle camera photo logic here
            console.log('Photo captured:', file);
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

            {/* Message Input - WhatsApp Style */}
            <div className="p-3 border-t border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                    {/* Attachment Button */}
                    <div className="relative" ref={attachmentMenuRef}>
                        <button
                            type="button"
                            onClick={toggleAttachmentMenu}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        {/* Attachment Menu */}
                        {showAttachmentMenu && (
                            <div className="absolute bottom-12 left-0 bg-slate-700 rounded-lg shadow-lg border border-slate-600 py-2 min-w-[160px] z-50">
                                <button
                                    onClick={handleCameraCapture}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
                                >
                                    <Camera className="w-4 h-4 text-green-400" />
                                    <span className="text-sm">Camera</span>
                                </button>
                                <button
                                    onClick={handleFileUpload}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
                                >
                                    <Paperclip className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm">Document</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Message Input Container */}
                    <div className="flex-1 relative bg-slate-700 rounded-2xl border border-slate-600">
                        <div className="flex items-center">
                            {/* Emoji Button */}
                            <button
                                type="button"
                                onClick={toggleEmojiPicker}
                                className={`p-2 ml-2 rounded-full transition-colors ${showEmojiPicker
                                    ? 'text-yellow-400'
                                    : 'text-slate-400 hover:text-yellow-400'
                                }`}
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Message"
                                className="flex-1 bg-transparent px-2 py-3 text-white placeholder-slate-400 text-base focus:outline-none"
                                style={{ fontSize: '16px' }}
                            />

                            {/* Voice Recording or Send Button */}
                            {newMessage.trim() ? (
                                <button
                                    type="submit"
                                    onClick={handleSendMessage}
                                    className="p-2 mr-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleVoiceRecording}
                                    className={`p-2 mr-2 rounded-full transition-all ${isRecording
                                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-600'
                                    }`}
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Emoji Picker */}
                        <div ref={emojiPickerRef} className="relative">
                            {showEmojiPicker && (
                                <CategoryEmojiPicker
                                    isOpen={showEmojiPicker}
                                    onEmojiSelect={handleEmojiSelect}
                                    onClose={closeEmojiPicker}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Hidden File Inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="*/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}

export default CompactChatContainer;