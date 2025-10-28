import React, { useState, useEffect } from 'react';
import { Bell, X, Heart, UserPlus, UserMinus, MessageCircle, Eye, Trash2, Check, CheckCheck } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
    } = useNotificationStore();

    const [page, setPage] = useState(1);
    const [hasMore] = useState(true);

    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            fetchNotifications(1);
        }
    }, [isOpen, fetchNotifications, notifications.length]);

    const loadMore = async () => {
        try {
            const nextPage = page + 1;
            await fetchNotifications(nextPage);
            setPage(nextPage);
            // Note: fetchNotifications handles appending to existing notifications
            // We'll rely on the response length to determine if there are more
        } catch (error) {
            console.error('Error loading more notifications:', error);
        }
    };

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
                navigate(`/profile/${notification.metadata?.senderUsername || notification.sender?.username}`);
                break;
            case 'message':
                navigate(`/chat`);
                break;
            default:
                break;
        }

        onClose();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'follow':
                return <UserPlus className="text-green-500" size={16} />;
            case 'unfollow':
                return <UserMinus className="text-red-500" size={16} />;
            case 'message':
                return <MessageCircle className="text-blue-500" size={16} />;
            case 'profile_view':
                return <Eye className="text-purple-500" size={16} />;
            default:
                return <Bell className="text-gray-500" size={16} />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return notificationDate.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:relative md:inset-auto">
            {/* Overlay for mobile */}
            <div className="absolute inset-0 bg-black bg-opacity-50 md:hidden" onClick={onClose} />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full bg-white shadow-xl md:relative md:h-auto md:w-96 md:rounded-lg md:border">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-500 hover:text-blue-600"
                                title="Mark all as read"
                            >
                                <CheckCheck size={18} />
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-sm text-red-500 hover:text-red-600"
                                title="Clear all"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto md:max-h-80">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="loading loading-spinner loading-md"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Bell className="mb-4 text-gray-400" size={48} />
                            <p className="text-gray-600">No notifications yet</p>
                            <p className="text-sm text-gray-500">When people interact with you, you'll see it here</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`group flex cursor-pointer items-start gap-3 border-b p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {/* Sender Avatar */}
                                    <div className="flex-shrink-0">
                                        {notification.sender?.profilePic ? (
                                            <img
                                                src={notification.sender.profilePic}
                                                alt={notification.sender.fullName}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                {notification.sender?.fullName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        {/* Notification type icon */}
                                        <div className="relative -mt-2 -ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-900">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        className="opacity-0 text-gray-400 hover:text-red-500 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Load more button */}
                            {hasMore && notifications.length >= 20 && (
                                <div className="p-4 text-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={isLoading}
                                        className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Loading...' : 'Load more'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;