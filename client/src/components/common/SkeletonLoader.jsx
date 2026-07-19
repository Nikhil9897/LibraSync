const SkeletonLoader = ({ type = 'card', count = 1, wrapperClass = "space-y-6 w-full" }) => {
    const renderSkeleton = (key) => {
        if (type === 'card') {
            return (
                <div
                    key={key}
                    className="rounded-2xl p-6 flex flex-col sm:flex-row gap-6 animate-pulse"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="w-full sm:w-40 h-56 rounded-xl" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                    <div className="flex-1 space-y-4 py-2">
                        <div className="h-6 rounded w-3/4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        <div className="space-y-2 pt-4">
                            <div className="h-4 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                            <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'grid-item') {
            return (
                <div
                    key={key}
                    className="rounded-lg p-4 animate-pulse h-full"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="h-48 rounded mb-3" style={{ backgroundColor: 'var(--surface-hover)' }} />
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--surface-hover)' }} />
                    <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--surface-hover)' }} />
                </div>
            );
        }

        if (type === 'detail') {
            return (
                <div
                    key={key}
                    className="rounded-3xl shadow-sm overflow-hidden animate-pulse"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="h-64" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                    <div className="p-8 md:p-12 space-y-6">
                        <div className="h-10 rounded w-1/2" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        <div className="h-6 rounded w-1/4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        <div className="space-y-3 pt-6">
                            <div className="h-4 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                            <div className="h-4 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default basic skeleton
        return (
            <div
                key={key}
                className="w-full h-24 rounded-xl animate-pulse"
                style={{ backgroundColor: 'var(--surface-hover)' }}
            ></div>
        );
    };

    return (
        <div className={wrapperClass}>
            {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
        </div>
    );
};

export default SkeletonLoader;
