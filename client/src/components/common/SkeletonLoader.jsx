const SkeletonLoader = ({ type = 'card', count = 1, wrapperClass = "space-y-6 w-full" }) => {
    const renderSkeleton = (key) => {
        // ... (unchanged)
        if (type === 'card') {
            return (
                <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 flex flex-col sm:flex-row gap-6 animate-pulse">
                    <div className="w-full sm:w-40 h-56 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-4 py-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="space-y-2 pt-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'grid-item') {
            return (
                <div key={key} className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 animate-pulse h-full">
                    <div className="bg-gray-200 h-48 rounded mb-3" />
                    <div className="bg-gray-200 h-4 rounded mb-2" />
                    <div className="bg-gray-200 h-3 rounded w-2/3" />
                </div>
            );
        }

        if (type === 'detail') {
            return (
                <div key={key} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-8 md:p-12 space-y-6">
                        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-3 pt-6">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default basic skeleton
        return (
            <div key={key} className="w-full h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        );
    };

    return (
        <div className={wrapperClass}>
            {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
        </div>
    );
};

export default SkeletonLoader;
