import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { CategorizedError, ErrorHandlingResult } from '../types/errors';
import { ErrorHandler } from '../utils/errorHandler';
import { navigateToLogin } from '../utils/navigation';

interface UseErrorHandlerReturn {
  error: CategorizedError | null;
  setError: (error: CategorizedError | null) => void;
  handleError: (error: unknown, context?: string) => ErrorHandlingResult;
  clearError: () => void;
  isError: boolean;
}

/**
 * Custom hook for handling errors in React components
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<CategorizedError | null>(null);

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
    setError(categorizedError);
    
    return ErrorHandler.handleError(categorizedError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
    isError: error !== null
  };
};

/**
 * Hook for handling async operations with error handling
 */
export const useAsyncErrorHandler = () => {
  const { error, setError, handleError, clearError, isError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err) {
      const handlingResult = handleError(err, context);
      
      // Handle authentication errors
      if (handlingResult.shouldLogout) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigateToLogin();
        return null;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    execute,
    error,
    isLoading,
    isError,
    clearError
  };
};
