import React from 'react';
import { useErrorContext } from '../../contexts/ErrorContext';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useErrorContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const getIcon = () => {
          switch (notification.type) {
            case 'success':
              return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'warning':
              return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'error':
              return <AlertCircle className="h-5 w-5 text-red-400" />;
            case 'info':
            default:
              return <Info className="h-5 w-5 text-blue-400" />;
          }
        };

        const getBackgroundColor = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'warning':
              return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'error':
              return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'info':
            default:
              return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
          }
        };

        const getTextColor = () => {
          switch (notification.type) {
            case 'success':
              return 'text-green-800 dark:text-green-200';
            case 'warning':
              return 'text-yellow-800 dark:text-yellow-200';
            case 'error':
              return 'text-red-800 dark:text-red-200';
            case 'info':
            default:
              return 'text-blue-800 dark:text-blue-200';
          }
        };

        return (
          <div
            key={notification.id}
            className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-full`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${getTextColor()}`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md`}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;
