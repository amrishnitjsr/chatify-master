import { MessageCircleIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const FloatingMessageButton = ({ onClick, hasUnreadMessages = false }) => {
    const { onlineUsers = [] } = useAuthStore();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 group"
        >
            <div className="flex items-center gap-2">
                <MessageCircleIcon className="size-6" />
                <span className="font-medium">Messages</span>

                {/* Online users count */}
                {onlineUsers && onlineUsers.length > 0 && (
                    <div className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full min-w-[20px]">
                        {onlineUsers.length}
                    </div>
                )}
            </div>

            {/* Notification dot for unread messages */}
            {hasUnreadMessages && (
                <div className="absolute -top-1 -right-1 bg-red-500 size-4 rounded-full border-2 border-white animate-pulse" />
            )}

            {/* Ripple effect on hover */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>
    );
};

export default FloatingMessageButton;