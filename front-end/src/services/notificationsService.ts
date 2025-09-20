import api from './api';
import { messageErrorHandler } from '../utils/messageErrorHandler';

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: number; // 1=SessionRequest, 2=SessionConfirmed, 3=SessionReminder, 4=SessionCompleted, 5=NewMessage, 6=NewReview, 7=CreditEarned, 8=CreditSpent, 9=System, 10=MatchFound, 11=GroupEvent
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  actionUrl?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    location?: string;
    dateOfBirth?: string;
    isEmailVerified: boolean;
    isIdVerified: boolean;
    createdAt: string;
    lastActiveAt?: string;
    profileImageUrl?: string;
    customAvatarUrl?: string;
    timeZone?: string;
    preferredLanguage?: string;
    creditBalance: number;
    averageRating: number;
    totalReviews: number;
  };
}

export interface CreateNotificationRequest {
  userId: string;
  type: number; // 1=SessionRequest, 2=SessionConfirmed, 3=SessionReminder, 4=SessionCompleted, 5=NewMessage, 6=NewReview, 7=CreditEarned, 8=CreditSpent, 9=System, 10=MatchFound, 11=GroupEvent
  title: string;
  message: string;
  actionUrl?: string;
  data?: any;
}

class NotificationsService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getNotifications', 'notification');
      throw error;
    }
  }

  async getUserNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>(`/notifications?unreadOnly=${unreadOnly}`);
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getUserNotifications', 'notification');
      throw error;
    }
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>(`/notifications?unreadOnly=true`);
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getUnreadNotifications', 'notification');
      throw error;
    }
  }

  async markAsRead(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid notification ID');
      }

      await api.post(`/notifications/${id}/mark-read`);
    } catch (error) {
      messageErrorHandler.handleError(error, 'markAsRead', 'notification');
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.post('/notifications/mark-all-read');
    } catch (error) {
      messageErrorHandler.handleError(error, 'markAllAsRead', 'notification');
      throw error;
    }
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getUnreadCount', 'notification');
      throw error;
    }
  }
}

export const notificationsService = new NotificationsService();
