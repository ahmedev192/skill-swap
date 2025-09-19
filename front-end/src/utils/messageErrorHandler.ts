import { useErrorContext } from '../contexts/ErrorContext';

export interface ApiError {
  message: string;
  errorCode?: string;
  details?: any;
  requestId?: string;
}

export interface MessageError {
  type: 'message' | 'notification' | 'connection';
  operation: string;
  error: ApiError;
  timestamp: Date;
}

export class MessageErrorHandler {
  private static instance: MessageErrorHandler;
  private errorContext: any;

  private constructor() {}

  public static getInstance(): MessageErrorHandler {
    if (!MessageErrorHandler.instance) {
      MessageErrorHandler.instance = new MessageErrorHandler();
    }
    return MessageErrorHandler.instance;
  }

  public setErrorContext(errorContext: any) {
    this.errorContext = errorContext;
  }

  public handleError(error: any, operation: string, type: 'message' | 'notification' | 'connection' = 'message'): MessageError {
    const messageError: MessageError = {
      type,
      operation,
      error: this.parseError(error),
      timestamp: new Date()
    };

    // Log error for debugging
    console.error(`[${type.toUpperCase()}] ${operation}:`, messageError);

    // Show user-friendly notification
    this.showUserNotification(messageError);

    return messageError;
  }

  private parseError(error: any): ApiError {
    if (error?.response?.data) {
      // API error response
      const apiError = error.response.data;
      return {
        message: apiError.message || 'An unexpected error occurred',
        errorCode: apiError.errorCode,
        details: apiError.details,
        requestId: apiError.requestId
      };
    } else if (error?.message) {
      // Standard Error object
      return {
        message: error.message,
        errorCode: 'CLIENT_ERROR'
      };
    } else {
      // Unknown error
      return {
        message: 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  private showUserNotification(messageError: MessageError) {
    if (this.errorContext?.addNotification) {
      let userMessage = messageError.error.message;
      
      // Customize message based on error type and operation
      switch (messageError.type) {
        case 'message':
          userMessage = this.getMessageErrorMessage(messageError.operation, messageError.error);
          break;
        case 'notification':
          userMessage = this.getNotificationErrorMessage(messageError.operation, messageError.error);
          break;
        case 'connection':
          userMessage = this.getConnectionErrorMessage(messageError.operation, messageError.error);
          break;
      }

      this.errorContext.addNotification({
        type: 'error',
        message: userMessage,
        duration: 5000
      });
    }
  }

  private getMessageErrorMessage(operation: string, error: ApiError): string {
    switch (operation) {
      case 'sendMessage':
        return 'Failed to send message. Please check your connection and try again.';
      case 'getConversations':
        return 'Failed to load conversations. Please refresh the page.';
      case 'getConversation':
        return 'Failed to load messages. Please try again.';
      case 'markMessagesAsRead':
        return 'Failed to mark messages as read.';
      case 'getUnreadCount':
        return 'Failed to load unread count.';
      default:
        return error.message;
    }
  }

  private getNotificationErrorMessage(operation: string, error: ApiError): string {
    switch (operation) {
      case 'getNotifications':
        return 'Failed to load notifications. Please refresh the page.';
      case 'markAsRead':
        return 'Failed to mark notification as read.';
      case 'markAllAsRead':
        return 'Failed to mark all notifications as read.';
      case 'getUnreadCount':
        return 'Failed to load notification count.';
      default:
        return error.message;
    }
  }

  private getConnectionErrorMessage(operation: string, error: ApiError): string {
    switch (operation) {
      case 'connect':
        return 'Failed to connect to chat service. Please check your internet connection.';
      case 'disconnect':
        return 'Connection to chat service lost. Attempting to reconnect...';
      case 'reconnect':
        return 'Failed to reconnect to chat service. Please refresh the page.';
      default:
        return 'Connection error occurred. Please try again.';
    }
  }

  public getErrorMessage(error: any): string {
    const parsedError = this.parseError(error);
    return parsedError.message;
  }

  public getErrorCode(error: any): string | undefined {
    const parsedError = this.parseError(error);
    return parsedError.errorCode;
  }

  public isRetryableError(error: any): boolean {
    const errorCode = this.getErrorCode(error);
    const retryableCodes = [
      'TIMEOUT',
      'CONNECTION_ERROR',
      'NETWORK_ERROR',
      'SERVER_ERROR'
    ];
    return retryableCodes.includes(errorCode || '');
  }
}

export const messageErrorHandler = MessageErrorHandler.getInstance();
