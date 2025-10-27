const PostsLoadingSkeleton = () => {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-slate-600 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-slate-600 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-20"></div>
                        </div>
                        <div className="h-8 w-8 bg-slate-600 rounded"></div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 mb-4">
                        <div className="h-4 bg-slate-600 rounded w-full"></div>
                        <div className="h-4 bg-slate-600 rounded w-4/5"></div>
                        <div className="h-4 bg-slate-600 rounded w-3/5"></div>
                    </div>

                    {/* Image placeholder (sometimes) */}
                    {i === 2 && (
                        <div className="h-48 bg-slate-600 rounded-lg mb-4"></div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex gap-4">
                            <div className="h-8 w-16 bg-slate-600 rounded"></div>
                            <div className="h-8 w-16 bg-slate-600 rounded"></div>
                        </div>
                        <div className="h-6 w-20 bg-slate-600 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostsLoadingSkeleton;