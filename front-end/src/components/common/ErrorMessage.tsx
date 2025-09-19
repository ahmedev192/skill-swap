import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { CategorizedError, ErrorSeverity } from '../../types/errors';

interface ErrorMessageProps {
  error: CategorizedError;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5" />;
      case ErrorSeverity.HIGH:
        return <AlertCircle className="w-5 h-5" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="w-5 h-5" />;
      case ErrorSeverity.LOW:
        return <Info className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getTextColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-800 dark:text-red-200';
      case ErrorSeverity.HIGH:
        return 'text-red-800 dark:text-red-200';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-800 dark:text-yellow-200';
      case ErrorSeverity.LOW:
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getIconColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-600 dark:text-red-400';
      case ErrorSeverity.HIGH:
        return 'text-red-600 dark:text-red-400';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-600 dark:text-yellow-400';
      case ErrorSeverity.LOW:
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {error.userMessage}
          </h3>
          
          {error.actionRequired && (
            <div className="mt-2">
              <p className={`text-sm ${getTextColor()}`}>
                <strong>Action required:</strong> {error.actionRequired}
              </p>
            </div>
          )}

          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className={`cursor-pointer text-sm ${getTextColor()} hover:underline`}>
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                <div><strong>Error Code:</strong> {error.code}</div>
                <div><strong>Category:</strong> {error.category}</div>
                <div><strong>Severity:</strong> {error.severity}</div>
                <div><strong>Timestamp:</strong> {error.timestamp.toISOString()}</div>
                <div><strong>Technical Message:</strong> {error.technicalMessage}</div>
                {error.details && (
                  <div><strong>Details:</strong> {JSON.stringify(error.details, null, 2)}</div>
                )}
              </div>
            </details>
          )}
        </div>

        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-gray-600`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
