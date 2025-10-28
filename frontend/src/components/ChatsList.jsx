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
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className="size-12 rounded-full object-cover border border-slate-600"
              />
              {onlineUsers.includes(chat._id) && (
                <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
              <p className="text-slate-400 text-xs">
                {onlineUsers.includes(chat._id) ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
