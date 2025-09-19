import api from './api';

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
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  }

  async getUserNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    const response = await api.get<Notification[]>(`/notifications?unreadOnly=${unreadOnly}`);
    return response.data;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>(`/notifications?unreadOnly=true`);
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await api.post(`/notifications/${id}/mark-read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data;
  }
}

export const notificationsService = new NotificationsService();
