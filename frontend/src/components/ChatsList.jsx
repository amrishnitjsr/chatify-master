import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <div className="space-y-2">
      {chats.map((chat, index) => (
        <div
          key={chat._id}
          className="group bg-slate-800/30 hover:bg-slate-700/50 active:bg-slate-700/70 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50 touch-manipulation"
          onClick={() => setSelectedUser(chat)}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className="size-14 rounded-full object-cover border-2 border-slate-600/50 group-hover:border-slate-500/70 transition-colors"
              />
              {onlineUsers.includes(chat._id) && (
                <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-green-500 border-3 border-slate-800 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-semibold truncate text-base group-hover:text-blue-400 transition-colors">
                  {chat.fullName}
                </h4>
                <span className="text-xs text-slate-500 ml-2">
                  {onlineUsers.includes(chat._id) ? (
                    <span className="text-green-400 font-medium">● Online</span>
                  ) : (
                    "Offline"
                  )}
                </span>
              </div>
              <p className="text-slate-400 text-sm truncate">
                @{chat.username || "user"}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg 
                className="size-5 text-slate-500 group-hover:text-slate-400 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default ChatsList;
