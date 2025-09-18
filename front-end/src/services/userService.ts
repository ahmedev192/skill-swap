import api from './api';

export interface User {
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
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  languages?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  messageNotifications: boolean;
  reviewNotifications: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showSessions: boolean;
  allowMessages: boolean;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<{
      data: User[];
      page: number;
      pageSize: number;
      totalCount: number;
    }>('/users');
    return response.data.data || [];
  }

  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>('/users/me', userData);
    return response.data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await api.post('/users/change-password', passwordData);
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    await api.put('/users/notification-settings', settings);
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<void> {
    await api.put('/users/privacy-settings', settings);
  }

  async searchUsers(searchTerm: string, location?: string, rating?: number): Promise<User[]> {
    const params = new URLSearchParams({ searchTerm });
    if (location) params.append('location', location);
    if (rating) params.append('rating', rating.toString());
    
    const response = await api.get<User[]>(`/users/search?${params}`);
    return response.data;
  }

  async getUserCredits(userId: string): Promise<{ balance: number; earned: number; spent: number; pending: number }> {
    const response = await api.get<{ balance: number; earned: number; spent: number; pending: number }>(`/users/${userId}/credits`);
    return response.data;
  }
}

export const userService = new UserService();
