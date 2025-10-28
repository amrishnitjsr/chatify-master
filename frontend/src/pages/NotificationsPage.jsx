import { useState, useEffect } from "react";
import { HeartIcon, MessageCircleIcon, UserPlusIcon, BellIcon, CheckIcon, EyeIcon, UserMinusIcon, CheckCheckIcon, Trash2Icon, XIcon } from "lucide-react";
import useNotificationStore from "../store/useNotificationStore";
import { useNavigate } from "react-router";

const NotificationsPage = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
    } = useNotificationStore();
    
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        // Fetch notifications and unread count on component mount
        fetchNotifications(1);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'follow':
            case 'unfollow':
            case 'profile_view':
                if (notification.sender?.username) {
                    navigate(`/profile/${notification.sender.username}`);
                }
                break;
            case 'message':
                navigate('/');
                break;
            case 'post_like':
            case 'post_comment':
                if (notification.entityId) {
                    // Navigate to post - for now go to home
                    navigate('/');
                }
                break;
            default:
                break;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "follow":
                return <UserPlusIcon className="size-8 text-green-500" />;
            case "unfollow":
                return <UserMinusIcon className="size-8 text-red-500" />;
            case "message":
                return <MessageCircleIcon className="size-8 text-blue-500" />;
            case "profile_view":
                return <EyeIcon className="size-8 text-purple-500" />;
            case "post_like":
                return <HeartIcon className="size-8 text-red-500 fill-current" />;
            case "post_comment":
                return <MessageCircleIcon className="size-8 text-blue-500" />;
            case "story_view":
                return <EyeIcon className="size-8 text-indigo-500" />;
            default:
                return <BellIcon className="size-8 text-slate-500" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        if (diffInSeconds < 60) return 'now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return notificationDate.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === "unread") return !notif.isRead;
        return true;
    });

    return (
        <div className="h-full overflow-y-auto bg-black md:bg-slate-900">
            {/* Header */}
            <div className="sticky top-0 bg-black md:bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-10">
                <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl md:text-2xl font-bold text-white">Activity</h1>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-500 hover:text-blue-400 font-medium"
                                    title="Mark all as read"
                                >
                                    <CheckCheckIcon size={16} />
                                    <span className="hidden md:inline">Mark all read</span>
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-500 hover:text-red-400 font-medium"
                                    title="Clear all"
                                >
                                    <Trash2Icon size={16} />
                                    <span className="hidden md:inline">Clear all</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "all"
                                    ? "border-white text-white"
                                    : "border-transparent text-slate-400 hover:text-white"
                            }`}
                        >
                            All
                            {notifications.length > 0 && (
                                <span className="ml-2 px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("unread")}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "unread"
                                    ? "border-white text-white"
                                    : "border-transparent text-slate-400 hover:text-white"
                            }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-0 md:p-4">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                            <div className="loading loading-spinner loading-lg"></div>
                            <p>Loading notifications...</p>
                        </div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                            <BellIcon className="size-12 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {activeTab === "unread" ? "You're all caught up!" : "No activity yet"}
                        </h3>
                        <p className="text-slate-400 max-w-sm">
                            {activeTab === "unread" 
                                ? "When you have new activity, you'll see it here" 
                                : "When people interact with your posts or follow you, you'll see it here"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0 md:space-y-2">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`group flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                                    !notification.isRead ? 'bg-slate-800/30 border-l-2 border-blue-500' : ''
                                } md:rounded-lg border-b border-slate-800 md:border-0`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {/* Sender Avatar */}
                                <div className="flex-shrink-0 relative">
                                    {notification.sender?.profilePic ? (
                                        <img
                                            src={notification.sender.profilePic}
                                            alt={notification.sender.fullName}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-white font-medium">
                                            {notification.sender?.fullName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    
                                    {/* Notification type icon overlay */}
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-black flex items-center justify-center border-2 border-slate-900">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-white leading-relaxed">
                                                <span className="font-semibold">{notification.sender?.fullName || 'Someone'}</span>
                                                {' '}
                                                <span className="text-slate-300">{notification.message}</span>
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification._id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 ml-2 p-2 text-slate-400 hover:text-red-500 transition-all"
                                        >
                                            <XIcon size={16} />
                                        </button>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                    )}

                                    {/* Additional metadata display */}
                                    {notification.metadata?.messageText && (
                                        <div className="mt-2 p-2 bg-slate-800 rounded text-sm text-slate-300">
                                            "{notification.metadata.messageText}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;