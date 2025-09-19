import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CategorizedError, ErrorHandlingResult } from '../types/errors';
import { ErrorHandler } from '../utils/errorHandler';
import { AxiosError } from 'axios';

interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  duration?: number;
  timestamp: Date;
}

interface ErrorContextType {
  // Error state
  currentError: CategorizedError | null;
  notifications: ErrorNotification[];
  
  // Error handling methods
  handleError: (error: unknown, context?: string) => ErrorHandlingResult;
  clearError: () => void;
  
  // Notification methods
  addNotification: (notification: Omit<ErrorNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Success notification
  showSuccess: (message: string, duration?: number) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [currentError, setCurrentError] = useState<CategorizedError | null>(null);
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const handleError = useCallback((error: unknown, context?: string): ErrorHandlingResult => {
    let categorizedError: CategorizedError;

    if (error && typeof error === 'object' && 'response' in error) {
      // Axios error
      categorizedError = ErrorHandler.fromAxiosError(error as AxiosError);
    } else {
      // Generic error
      categorizedError = ErrorHandler.fromGenericError(error);
    }

    ErrorHandler.logError(categorizedError, context);
    setCurrentError(categorizedError);
    
    const handlingResult = ErrorHandler.handleError(categorizedError);
    
    // Add notification based on handling result
    if (handlingResult.userNotification) {
      addNotification({
        type: handlingResult.userNotification.type,
        message: handlingResult.userNotification.message,
        duration: handlingResult.userNotification.duration
      });
    }
    
    return handlingResult;
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message: string, duration: number = 3000) => {
    addNotification({
      type: 'success',
      message,
      duration
    });
  }, [addNotification]);

  const value: ErrorContextType = {
    currentError,
    notifications,
    handleError,
    clearError,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};
