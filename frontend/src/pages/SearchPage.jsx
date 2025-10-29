import { useState, useEffect } from "react";
import { SearchIcon, XIcon, UserIcon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const SearchPage = ({ onUserClick }) => {
    const { onlineUsers } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [_isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const delayedSearch = setTimeout(() => {
                handleSearch(searchQuery);
            }, 300);
            return () => clearTimeout(delayedSearch);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            // Use the contacts endpoint to search for users
            const res = await axiosInstance.get("/messages/contacts");
            const filtered = res.data.filter(user =>
                user.fullName.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        // Add to recent searches
        const updated = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));

        // Navigate to user profile
        if (onUserClick) {
            onUserClick(user._id);
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    const removeRecentSearch = (userId) => {
        const updated = recentSearches.filter(u => u._id !== userId);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    // Utility to detect mobile/Android
    const isMobile = typeof window !== 'undefined' && /android|iphone|ipad|mobile/i.test(window.navigator.userAgent);

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* Search Sidebar or Topbar */}
            <div className={isMobile ? "w-full border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm" : "w-96 border-r border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"}>
                {/* Header */}
                <div className={isMobile ? "p-4 border-b border-slate-700/50" : "p-6 border-b border-slate-700/50"}>
                    <h1 className="text-2xl font-semibold text-white mb-4">Search</h1>

                    {/* Search Input */}
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={isMobile
                                ? "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg"
                                : "w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            }
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <XIcon className="size-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results or Recent */}
                <div className="flex-1 overflow-y-auto">
                    {searchQuery ? (
                        /* Search Results */
                        <div className="p-4">
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="size-12 bg-slate-700 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
                                                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleUserSelect(user)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user.profilePic || "/avatar.png"}
                                                    alt={user.fullName}
                                                    className="size-12 rounded-full object-cover border border-slate-600"
                                                />
                                                {onlineUsers?.includes(user._id) && (
                                                    <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-slate-400 text-sm truncate">
                                                    @{user.username || user.email?.split('@')[0]} • {onlineUsers?.includes(user._id) ? 'Active now' : 'Offline'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <UserIcon className="size-16 mx-auto mb-4 opacity-30 text-slate-400" />
                                    <p className="text-slate-400">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Recent Searches */
                        <div className="p-4">
                            {recentSearches.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-semibold">Recent</h3>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {recentSearches.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors group"
                                            >
                                                <div
                                                    className="flex items-center gap-3 flex-1"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={user.profilePic || "/avatar.png"}
                                                            alt={user.fullName}
                                                            className="size-12 rounded-full object-cover border border-slate-600"
                                                        />
                                                        {onlineUsers?.includes(user._id) && (
                                                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-slate-400 text-sm truncate">
                                                            @{user.username || user.email?.split('@')[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeRecentSearch(user._id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-all"
                                                >
                                                    <XIcon className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <SearchIcon className="size-16 mx-auto mb-4 opacity-30 text-slate-400" />
                                    <p className="text-slate-400">No recent searches</p>
                                    <p className="text-slate-500 text-sm mt-1">Try searching for people</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center bg-slate-900/50">
                <div className="text-center">
                    <SearchIcon className="size-20 mx-auto mb-4 opacity-20 text-slate-400" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Search for people</h2>
                    <p className="text-slate-400">Find friends and discover new people to connect with</p>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;