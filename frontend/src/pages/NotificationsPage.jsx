import { useState, useEffect } from "react";
import { HeartIcon, MessageCircleIcon, UserPlusIcon, BellIcon, CheckIcon } from "lucide-react";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        // Mock notifications data - replace with real API call
        const mockNotifications = [
            {
                id: 1,
                type: "like",
                user: {
                    fullName: "John Doe",
                    username: "johndoe",
                    profilePic: "/avatar.png"
                },
                post: {
                    imageUrl: "/avatar.png",
                    text: "Beautiful sunset!"
                },
                message: "liked your post",
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                isRead: false
            },
            {
                id: 2,
                type: "comment",
                user: {
                    fullName: "Jane Smith",
                    username: "janesmith",
                    profilePic: "/avatar.png"
                },
                post: {
                    imageUrl: "/avatar.png",
                    text: "Amazing recipe!"
                },
                message: "commented on your post",
                comment: "This looks delicious! 😍",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                isRead: false
            },
            {
                id: 3,
                type: "follow",
                user: {
                    fullName: "Mike Johnson",
                    username: "mikej",
                    profilePic: "/avatar.png"
                },
                message: "started following you",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
                isRead: true
            },
            {
                id: 4,
                type: "like",
                user: {
                    fullName: "Sarah Wilson",
                    username: "sarahw",
                    profilePic: "/avatar.png"
                },
                post: {
                    imageUrl: null,
                    text: "Just finished an amazing workout! 💪"
                },
                message: "and 12 others liked your post",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                isRead: true
            }
        ];
        setNotifications(mockNotifications);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return <HeartIcon className="size-8 text-red-500 fill-current" />;
            case "comment":
                return <MessageCircleIcon className="size-8 text-blue-500" />;
            case "follow":
                return <UserPlusIcon className="size-8 text-green-500" />;
            default:
                return <BellIcon className="size-8 text-slate-500" />;
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
        );
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === "unread") return !notif.isRead;
        return true;
    });

    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 z-10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "all"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("unread")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === "unread"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                                }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="p-6">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                        <BellIcon className="size-16 mx-auto mb-4 opacity-30 text-slate-400" />
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {activeTab === "unread" ? "All caught up!" : "No notifications yet"}
                        </h2>
                        <p className="text-slate-400">
                            {activeTab === "unread"
                                ? "You have no unread notifications."
                                : "When people interact with your posts, you'll see it here."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${notification.isRead
                                        ? "hover:bg-slate-700/30"
                                        : "bg-slate-700/20 hover:bg-slate-700/40 border-l-2 border-blue-500"
                                    }`}
                            >
                                {/* User Profile */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={notification.user.profilePic}
                                        alt={notification.user.fullName}
                                        className="size-12 rounded-full object-cover border border-slate-600"
                                    />
                                    <div className="absolute -bottom-1 -right-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-white">
                                                <span className="font-semibold">
                                                    {notification.user.fullName}
                                                </span>
                                                {" "}
                                                <span className="text-slate-300">
                                                    {notification.message}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="inline-block size-2 bg-blue-500 rounded-full ml-2"></span>
                                                )}
                                            </p>

                                            {/* Comment text if it's a comment notification */}
                                            {notification.comment && (
                                                <p className="text-slate-400 text-sm mt-1">
                                                    "{notification.comment}"
                                                </p>
                                            )}

                                            <p className="text-slate-500 text-sm mt-1">
                                                {getTimeAgo(notification.timestamp)}
                                            </p>
                                        </div>

                                        {/* Post thumbnail for post-related notifications */}
                                        {notification.post && (
                                            <div className="flex-shrink-0">
                                                {notification.post.imageUrl ? (
                                                    <img
                                                        src={notification.post.imageUrl}
                                                        alt="Post"
                                                        className="size-12 rounded object-cover border border-slate-600"
                                                    />
                                                ) : (
                                                    <div className="size-12 bg-slate-700 rounded flex items-center justify-center border border-slate-600">
                                                        <span className="text-slate-400 text-xs text-center p-1 line-clamp-2">
                                                            {notification.post.text?.slice(0, 20)}...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Follow back button for follow notifications */}
                                        {notification.type === "follow" && (
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                Follow back
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Read indicator */}
                                {notification.isRead && (
                                    <div className="flex-shrink-0 text-slate-500 mt-1">
                                        <CheckIcon className="size-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;