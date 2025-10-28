import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';
import NotificationPanel from './NotificationPanel';

const NotificationButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        // Fetch unread count on component mount
        fetchUnreadCount();

        // Set up interval to refresh unread count
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const closePanel = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={togglePanel}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2">
                    <NotificationPanel isOpen={isOpen} onClose={closePanel} />
                </div>
            )}
        </div>
    );
};

export default NotificationButton;