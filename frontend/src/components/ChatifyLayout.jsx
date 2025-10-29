import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useNotificationStore from "../store/useNotificationStore";
import {
    HomeIcon,
    SearchIcon,
    CompassIcon,
    PlayCircleIcon,
    MessageCircleIcon,
    HeartIcon,
    PlusSquareIcon,
    UserIcon,
    MoreHorizontalIcon,
    LogOutIcon,
    XIcon
} from "lucide-react";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import ExplorePage from "../pages/ExplorePage";
import ReelsPage from "../pages/ReelsPage";
import NotificationsPage from "../pages/NotificationsPage";
import CreatePage from "../pages/CreatePage";
import CompactChatContainer from "./CompactChatContainer";
import ChatsList from "./ChatsList";
import ContactList from "./ContactList";
import ActiveTabSwitch from "./ActiveTabSwitch";
import FloatingMessageButton from "./FloatingMessageButton";
import SuggestedUsers from "./SuggestedUsers";
import SoundSettings from "./SoundSettings";
import { useChatStore } from "../store/useChatStore";

const ChatifyLayout = () => {
    const { authUser, logout, onlineUsers } = useAuthStore();
    const { selectedUser, getUnreadMessageCount } = useChatStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();
    const [activeTab, setActiveTab] = useState("home");
    const [showMessagesPanel, setShowMessagesPanel] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);

    // Open chat window automatically if a user is selected for chat
    useEffect(() => {
        if (selectedUser) {
            setShowMessagesPanel(true);
        }
    }, [selectedUser]);

    const navigationItems = [
        { id: "home", icon: HomeIcon, label: "Home" },
        { id: "search", icon: SearchIcon, label: "Search" },
        { id: "explore", icon: CompassIcon, label: "Explore" },
        { id: "reels", icon: PlayCircleIcon, label: "Reels" },
        { id: "notifications", icon: HeartIcon, label: "Notifications" },
        { id: "create", icon: PlusSquareIcon, label: "Create" },
        { id: "profile", icon: UserIcon, label: "Profile" },
    ];

    const handleNavClick = (itemId) => {
        setActiveTab(itemId);
        setShowMessagesPanel(false); // Close messages panel when navigating
    };

    // Fetch unread notification count on component mount
    useEffect(() => {
        if (authUser) {
            fetchUnreadCount();
        }
    }, [authUser, fetchUnreadCount]);

    const handleUserProfileClick = (userId) => {
        setActiveTab("profile");
        setSelectedProfileUserId(userId);
    };

    const handleLogout = () => {
        logout();
        setShowMoreMenu(false);
    };

    const renderMainContent = () => {
        switch (activeTab) {
            case "home":
                return <HomePage />;
            case "profile":
                return <ProfilePage userId={selectedProfileUserId || authUser?._id} />;
            case "search":
                return <SearchPage onUserClick={handleUserProfileClick} />;
            case "explore":
                return <ExplorePage />;
            case "reels":
                return <ReelsPage />;
            case "notifications":
                return <NotificationsPage />;
            case "create":
                return <CreatePage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className="h-screen bg-slate-900 flex flex-col md:flex-row relative overflow-hidden">
            {/* Background Decorators */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
            <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

            {/* Mobile Header - Chatify Android Style */}
            <div className="md:hidden bg-black border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent" style={{ fontFamily: 'Chatify Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Chatify
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleNavClick("notifications")}
                            className="p-1 text-white relative"
                        >
                            <HeartIcon className="size-7" strokeWidth={1.5} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowMessagesPanel(true)}
                            className="p-1 text-white relative"
                        >
                            <MessageCircleIcon className="size-7" strokeWidth={1.5} />
                            {/* Message count badge */}
                            {getUnreadMessageCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {getUnreadMessageCount() > 9 ? '9+' : getUnreadMessageCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Left Sidebar Navigation - Hidden on mobile */}
            <div className="hidden md:flex w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex-col relative z-10 h-full">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
                        Chatify
                    </h1>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-4">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors ${isActive
                                    ? "text-white bg-slate-700/50"
                                    : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                                    }`}
                            >
                                <Icon className="size-6" />
                                <span className="font-medium">{item.label}</span>
                                {item.id === "notifications" && unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* More Menu */}
                <div className="p-4 border-t border-slate-700/50 relative">
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="w-full flex items-center gap-4 px-2 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                    >
                        <MoreHorizontalIcon className="size-6" />
                        <span className="font-medium">More</span>
                    </button>

                    {showMoreMenu && (
                        <>
                            <div className="absolute bottom-16 left-4 right-4 bg-slate-700 rounded-lg shadow-lg border border-slate-600 py-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow"
                                >
                                    <LogOutIcon className="size-4" />
                                    <span>Log out</span>
                                </button>
                            </div>
                            <div
                                className="fixed inset-0 z-0"
                                onClick={() => setShowMoreMenu(false)}
                            />
                        </>
                    )}
                </div>

                {/* User Profile - Clickable */}
                <div className="p-4 border-t border-slate-700/50">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => handleUserProfileClick(authUser?._id)}
                    >
                        <img
                            src={authUser?.profilePic || "/avatar.png"}
                            alt={authUser?.fullName}
                            className="size-10 rounded-full object-cover border border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                                {authUser?.fullName}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                                @{authUser?.username || authUser?.email?.split('@')[0]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full width on mobile like Chatify */}
            <div className="flex-1 flex relative z-10 overflow-hidden pb-16 md:pb-0 bg-black md:bg-slate-900">
                {/* Main Feed */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {renderMainContent()}
                    </div>
                </div>

                {/* Right Sidebar - Only show on home page and larger screens */}
                {activeTab === "home" && (
                    <div className="hidden xl:block w-80 p-6 overflow-y-auto">
                        <SuggestedUsers onUserClick={handleUserProfileClick} />
                    </div>
                )}
            </div>

            {/* Chatify Android Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-slate-800 z-30">
                <div className="flex items-center justify-around px-2 py-3">
                    {/* Home */}
                    <button
                        onClick={() => handleNavClick("home")}
                        className="p-2"
                    >
                        <HomeIcon
                            className={`size-7 ${activeTab === "home" ? "text-white fill-current" : "text-white"}`}
                            strokeWidth={1.5}
                        />
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => handleNavClick("search")}
                        className="p-2"
                    >
                        <SearchIcon
                            className={`size-7 ${activeTab === "search" ? "text-white" : "text-white"}`}
                            strokeWidth={1.5}
                        />
                    </button>

                    {/* Create Post */}
                    <button
                        onClick={() => handleNavClick("create")}
                        className="p-2"
                    >
                        <PlusSquareIcon
                            className={`size-7 ${activeTab === "create" ? "text-white" : "text-white"}`}
                            strokeWidth={1.5}
                        />
                    </button>

                    {/* Reels */}
                    <button
                        onClick={() => handleNavClick("reels")}
                        className="p-2"
                    >
                        <PlayCircleIcon
                            className={`size-7 ${activeTab === "reels" ? "text-white" : "text-white"}`}
                            strokeWidth={1.5}
                        />
                    </button>

                    {/* Profile */}
                    <button
                        onClick={() => handleUserProfileClick(authUser?._id)}
                        className="p-1"
                    >
                        <div className={`size-8 rounded-full border-2 ${activeTab === "profile" ? "border-white" : "border-transparent"}`}>
                            <img
                                src={authUser?.profilePic || "/avatar.png"}
                                alt={authUser?.fullName}
                                className="size-full rounded-full object-cover"
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Floating Message Button - Hidden when messages panel is open or on mobile */}
            {!showMessagesPanel && (
                <div className="hidden md:block">
                    <FloatingMessageButton
                        onClick={() => setShowMessagesPanel(true)}
                        hasUnreadMessages={false} // You can add logic to detect unread messages
                    />
                </div>
            )}

            {/* Messages Modal - Responsive */}
            {showMessagesPanel && (
                <div className="fixed inset-0 md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-96 md:h-[500px] bg-slate-800/95 backdrop-blur-sm md:rounded-2xl border-0 md:border border-slate-700/50 z-50 flex flex-col shadow-2xl">
                    {!selectedUser ? (
                        /* Chat List View */
                        <>
                            {/* Messages Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                                <h2 className="text-white font-semibold text-lg">Messages</h2>
                                <div className="flex items-center gap-2">
                                    <SoundSettings compact={true} />
                                    <button
                                        onClick={() => setShowMessagesPanel(false)}
                                        className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                                    >
                                        <XIcon className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Active Tab Switch */}
                            <div className="px-4 py-2 border-b border-slate-700/30">
                                <ActiveTabSwitch />
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                <ChatsList />
                            </div>
                        </>
                    ) : (
                        /* Individual Chat View */
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
                                <button
                                    onClick={() => {
                                        const { setSelectedUser } = useChatStore.getState();
                                        setSelectedUser(null);
                                    }}
                                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="relative">
                                    <img
                                        src={selectedUser?.profilePic || "/avatar.png"}
                                        alt={selectedUser?.fullName}
                                        className="size-8 rounded-full object-cover border border-slate-600"
                                    />
                                    {/* Online indicator */}
                                    {onlineUsers?.includes(selectedUser?._id) && (
                                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium text-sm truncate">{selectedUser?.fullName}</h3>
                                    <p className="text-slate-400 text-xs">
                                        {onlineUsers?.includes(selectedUser?._id) ? "Active now" : "Offline"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMessagesPanel(false)}
                                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                                >
                                    <XIcon className="size-4" />
                                </button>
                            </div>

                            {/* Chat Messages Container */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <CompactChatContainer />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Backdrop for closing messages modal */}
            {showMessagesPanel && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMessagesPanel(false)}
                />
            )}
        </div>
    );
};

export default ChatifyLayout;