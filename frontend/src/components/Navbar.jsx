import { Link, useLocation } from "react-router";
import { MessageCircleIcon, HomeIcon, UserIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
    const location = useLocation();
    const { authUser } = useAuthStore();

    const navItems = [
        {
            path: "/home",
            icon: HomeIcon,
            label: "Home",
            description: "Feed"
        },
        {
            path: `/profile/${authUser?._id}`,
            icon: UserIcon,
            label: "Profile",
            description: "My Profile"
        },
        {
            path: "/chat",
            icon: MessageCircleIcon,
            label: "Chat",
            description: "Messages"
        }
    ];

    return (
        <nav className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">💬</div>
                        <span className="text-xl font-bold text-white">Chatify</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {/* eslint-disable-next-line no-unused-vars */}
                        {navItems.map(({ path, icon: IconComponent, label, description }) => {
                            const isActive = location.pathname === path;

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <IconComponent className="size-5" />
                                    <div className="hidden sm:block">
                                        <div className="font-medium">{label}</div>
                                        <div className="text-xs opacity-75">{description}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/profile/${authUser?._id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                        >
                            {authUser?.profilePic ? (
                                <img
                                    src={authUser.profilePic}
                                    alt="Profile"
                                    className="size-8 rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="size-8 p-1 bg-slate-700 rounded-full" />
                            )}
                            <span className="text-sm hidden sm:block">{authUser?.fullName}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;