// Standard error response format from backend
export interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  validationErrors?: Record<string, string[]>;
}

// Frontend error types
export interface FrontendError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  source: 'api' | 'validation' | 'network' | 'unknown';
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better organization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Enhanced error interface with categorization
export interface CategorizedError extends FrontendError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  userMessage: string; // User-friendly message
  technicalMessage: string; // Technical message for developers
  actionRequired?: string; // What action the user should take
  retryable: boolean; // Whether the operation can be retried
}

// Error handling result
export interface ErrorHandlingResult {
  error: CategorizedError;
  shouldRetry: boolean;
  shouldLogout: boolean;
  shouldRedirect?: string;
  userNotification: {
    type: 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  };
}
