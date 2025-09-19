import { AxiosError } from 'axios';
import { 
  ErrorResponse, 
  FrontendError, 
  CategorizedError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorHandlingResult 
} from '../types/errors';

/**
 * Centralized error handling utility for the frontend
 */
export class ErrorHandler {
  /**
   * Converts an Axios error to a standardized frontend error
   */
  static fromAxiosError(error: AxiosError): CategorizedError {
    const timestamp = new Date();
    
    // Check if it's a network error
    if (!error.response) {
      return {
        message: 'Network connection failed',
        code: 'NETWORK_ERROR',
        timestamp,
        source: 'network',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        technicalMessage: `Network error: ${error.message}`,
        actionRequired: 'Check your internet connection and try again.',
        retryable: true
      };
    }

    // Parse the error response
    const errorResponse = error.response.data as ErrorResponse;
    const status = error.response.status;

    return this.categorizeError(errorResponse, status, timestamp);
  }

  /**
   * Converts a generic error to a standardized frontend error
   */
  static fromGenericError(error: Error | unknown): CategorizedError {
    const timestamp = new Date();
    
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'GENERIC_ERROR',
        timestamp,
        source: 'unknown',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        userMessage: 'An unexpected error occurred. Please try again.',
        technicalMessage: error.message,
        actionRequired: 'Please try again or contact support if the problem persists.',
        retryable: true
      };
    }

    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      timestamp,
      source: 'unknown',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: String(error),
      actionRequired: 'Please try again or contact support if the problem persists.',
      retryable: true
    };
  }

  /**
   * Categorizes an error response based on status code and error details
   */
  private static categorizeError(
    errorResponse: ErrorResponse, 
    status: number, 
    timestamp: Date
  ): CategorizedError {
    const baseError: CategorizedError = {
      message: errorResponse.message,
      code: errorResponse.errorCode,
      details: errorResponse.details,
      timestamp,
      source: 'api',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      userMessage: errorResponse.message,
      technicalMessage: errorResponse.message,
      actionRequired: 'Please try again.',
      retryable: false
    };

    switch (status) {
      case 400:
        return {
          ...baseError,
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.VALIDATION,
          userMessage: this.getValidationErrorMessage(errorResponse),
          technicalMessage: errorResponse.message,
          actionRequired: 'Please check your input and try again.',
          retryable: false
        };

      case 401:
        return {
          ...baseError,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.AUTHENTICATION,
          userMessage: 'Your session has expired. Please log in again.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please log in again.',
          retryable: false
        };

      case 403:
        return {
          ...baseError,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.AUTHORIZATION,
          userMessage: 'You do not have permission to perform this action.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Contact your administrator if you believe this is an error.',
          retryable: false
        };

      case 404:
        return {
          ...baseError,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.CLIENT,
          userMessage: 'The requested resource was not found.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please check the URL or try refreshing the page.',
          retryable: false
        };

      case 409:
        return {
          ...baseError,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.CLIENT,
          userMessage: 'This action conflicts with existing data.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please check your data and try again.',
          retryable: true
        };

      case 422:
        return {
          ...baseError,
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.VALIDATION,
          userMessage: this.getValidationErrorMessage(errorResponse),
          technicalMessage: errorResponse.message,
          actionRequired: 'Please correct the validation errors and try again.',
          retryable: false
        };

      case 429:
        return {
          ...baseError,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.SERVER,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please wait a few seconds before trying again.',
          retryable: true
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          ...baseError,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SERVER,
          userMessage: 'Server error occurred. Please try again later.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please try again in a few minutes.',
          retryable: true
        };

      default:
        return {
          ...baseError,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.UNKNOWN,
          userMessage: errorResponse.message || 'An unexpected error occurred.',
          technicalMessage: errorResponse.message,
          actionRequired: 'Please try again or contact support.',
          retryable: true
        };
    }
  }

  /**
   * Gets user-friendly validation error message
   */
  private static getValidationErrorMessage(errorResponse: ErrorResponse): string {
    if (errorResponse.validationErrors) {
      const errors = Object.values(errorResponse.validationErrors).flat();
      if (errors.length === 1) {
        return errors[0];
      } else if (errors.length > 1) {
        return `Multiple validation errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`;
      }
    }
    return errorResponse.message || 'Please check your input and try again.';
  }

  /**
   * Handles an error and returns appropriate actions
   */
  static handleError(error: CategorizedError): ErrorHandlingResult {
    const shouldLogout = error.category === ErrorCategory.AUTHENTICATION;
    const shouldRetry = error.retryable;
    
    let shouldRedirect: string | undefined;
    if (shouldLogout) {
      shouldRedirect = '/login';
    }

    let notificationType: 'error' | 'warning' | 'info' = 'error';
    if (error.severity === ErrorSeverity.LOW) {
      notificationType = 'warning';
    } else if (error.severity === ErrorSeverity.CRITICAL) {
      notificationType = 'error';
    }

    return {
      error,
      shouldRetry,
      shouldLogout,
      shouldRedirect,
      userNotification: {
        type: notificationType,
        message: error.userMessage,
        duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 5000 // Critical errors don't auto-dismiss
      }
    };
  }

  /**
   * Logs an error for debugging purposes
   */
  static logError(error: CategorizedError, context?: string): void {
    const logData = {
      message: error.technicalMessage,
      code: error.code,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp,
      context,
      details: error.details
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('HIGH SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('MEDIUM SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('LOW SEVERITY ERROR:', logData);
        break;
    }
  }
}

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string): ErrorHandlingResult => {
    let categorizedError: CategorizedError;

    if (error && typeof error === 'object' && 'response' in error) {
      // Axios error
      categorizedError = ErrorHandler.fromAxiosError(error as AxiosError);
    } else {
      // Generic error
      categorizedError = ErrorHandler.fromGenericError(error);
    }

    ErrorHandler.logError(categorizedError, context);
    return ErrorHandler.handleError(categorizedError);
  };

  return { handleError };
};
