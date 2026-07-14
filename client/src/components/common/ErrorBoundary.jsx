import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-slate-700 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-2xl shadow-lg border dark:border-slate-700 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                            ⚠️
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong.</h1>
                        <p className="text-gray-500 dark:text-slate-400 mb-6">
                            We're sorry, but the application encountered an unexpected error. 
                            Our team has been notified.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#0d5959] text-white font-medium rounded-xl hover:bg-[#0a4747] transition-colors shadow-sm w-full"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
