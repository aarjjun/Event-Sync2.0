import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full overflow-auto border border-gray-700">
                        <h2 className="text-xl font-semibold mb-2 text-red-400">{this.state.error?.toString()}</h2>
                        <details className="whitespace-pre-wrap text-sm text-gray-400">
                            {this.state.errorInfo?.componentStack}
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                    >
                        Return Home
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-gray-400 hover:text-white underline"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
