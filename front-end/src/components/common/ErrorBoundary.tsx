import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { CategorizedError, ErrorSeverity, ErrorCategory } from '../../types/errors';
import { ErrorHandler } from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: CategorizedError) => void;
}

interface State {
  hasError: boolean;
  error: CategorizedError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const categorizedError = ErrorHandler.fromGenericError(error);
    return {
      hasError: true,
      error: categorizedError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const categorizedError = ErrorHandler.fromGenericError(error);
    categorizedError.details = {
      ...categorizedError.details,
      componentStack: errorInfo.componentStack
    };
    
    ErrorHandler.logError(categorizedError, 'ErrorBoundary');
    
    if (this.props.onError) {
      this.props.onError(categorizedError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      if (!error) return null;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {error.severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Something went wrong'}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error.userMessage}
              </p>

              {error.actionRequired && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>What to do:</strong> {error.actionRequired}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {error.retryable && (
                  <button
                    onClick={this.handleRetry}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                    <div><strong>Error:</strong> {error.technicalMessage}</div>
                    <div><strong>Code:</strong> {error.code}</div>
                    <div><strong>Category:</strong> {error.category}</div>
                    <div><strong>Severity:</strong> {error.severity}</div>
                    <div><strong>Timestamp:</strong> {error.timestamp.toISOString()}</div>
                    {error.details && (
                      <div><strong>Details:</strong> {JSON.stringify(error.details, null, 2)}</div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
