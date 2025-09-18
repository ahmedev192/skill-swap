import api from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'SessionRequest' | 'SessionConfirmed' | 'SessionCancelled' | 'Message' | 'Review' | 'System';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

export interface CreateNotificationRequest {
  userId: string;
  type: 'SessionRequest' | 'SessionConfirmed' | 'SessionCancelled' | 'Message' | 'Review' | 'System';
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

  async markAsRead(id: string): Promise<void> {
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
