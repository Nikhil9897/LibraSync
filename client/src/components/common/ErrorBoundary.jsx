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
                <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
                    <div
                        className="max-w-lg w-full rounded-2xl shadow-lg border p-8 text-center"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                            style={{
                                backgroundColor: 'var(--danger-muted)',
                                color: 'var(--danger)',
                            }}
                        >
                            ⚠️
                        </div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Oops! Something went wrong.
                        </h1>
                        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            We're sorry, but the application encountered an unexpected error. 
                            Please try reloading the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 text-white font-medium rounded-xl transition-all shadow-sm w-full ls-btn-primary"
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
