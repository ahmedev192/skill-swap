import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, User, Skill, UserSkill, Session, Message, Review, Notification, Conversation, PaginatedResponse } from '../types';

const BASE_URL = 'https://localhost:51422'; // Update with your API URL

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('refresh_token', response.refreshToken);
              
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${response.token}`;
              return this.client.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    bio?: string;
    location?: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post('/api/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post('/api/auth/refresh-token', { refreshToken });
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.post('/api/auth/logout', { refreshToken });
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/users/me');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get(`/api/users/${id}`);
    return response.data;
  }

  async updateCurrentUser(data: Partial<User>): Promise<User> {
    const response = await this.client.put('/api/users/me', data);
    return response.data;
  }

  async searchUsers(searchTerm: string, location?: string): Promise<User[]> {
    const response = await this.client.get('/api/users/search', {
      params: { searchTerm, location }
    });
    return response.data;
  }

  // Skills endpoints
  async getSkills(): Promise<Skill[]> {
    const response = await this.client.get('/api/skills');
    return response.data;
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const response = await this.client.get(`/api/skills/user/${userId}`);
    return response.data;
  }

  async getUserOfferedSkills(userId: string): Promise<UserSkill[]> {
    const response = await this.client.get(`/api/skills/user/${userId}/offered`);
    return response.data;
  }

  async getUserRequestedSkills(userId: string): Promise<UserSkill[]> {
    const response = await this.client.get(`/api/skills/user/${userId}/requested`);
    return response.data;
  }

  async createUserSkill(data: {
    skillId: number;
    type: number;
    level: number;
    description?: string;
    requirements?: string;
    creditsPerHour: number;
  }): Promise<UserSkill> {
    const response = await this.client.post('/api/skills/user', data);
    return response.data;
  }

  async updateUserSkill(userSkillId: number, data: Partial<UserSkill>): Promise<UserSkill> {
    const response = await this.client.put(`/api/skills/user/${userSkillId}`, data);
    return response.data;
  }

  async deleteUserSkill(userSkillId: number): Promise<void> {
    await this.client.delete(`/api/skills/user/${userSkillId}`);
  }

  async searchSkills(searchTerm: string, category?: string, location?: string): Promise<UserSkill[]> {
    const response = await this.client.get('/api/skills/search', {
      params: { searchTerm, category, location }
    });
    return response.data;
  }

  // Matching endpoints
  async getMyMatches(): Promise<UserSkill[]> {
    const response = await this.client.get('/api/matching/my-matches');
    return response.data;
  }

  async getRecommendedSkills(): Promise<UserSkill[]> {
    const response = await this.client.get('/api/matching/recommended-skills');
    return response.data;
  }

  async getRecommendedUsers(): Promise<User[]> {
    const response = await this.client.get('/api/matching/recommended-users');
    return response.data;
  }

  // Sessions endpoints
  async getMySessions(): Promise<Session[]> {
    const response = await this.client.get('/api/sessions/my-sessions');
    return response.data;
  }

  async getTeachingSessions(): Promise<Session[]> {
    const response = await this.client.get('/api/sessions/teaching');
    return response.data;
  }

  async getLearningSessions(): Promise<Session[]> {
    const response = await this.client.get('/api/sessions/learning');
    return response.data;
  }

  async createSession(data: {
    teacherId: string;
    userSkillId: number;
    scheduledStart: string;
    scheduledEnd: string;
    notes?: string;
    isOnline: boolean;
    location?: string;
  }): Promise<Session> {
    const response = await this.client.post('/api/sessions', data);
    return response.data;
  }

  async confirmSession(sessionId: number, confirmed: boolean): Promise<void> {
    await this.client.post(`/api/sessions/${sessionId}/confirm`, { confirmed });
  }

  async cancelSession(sessionId: number, reason: string): Promise<void> {
    await this.client.post(`/api/sessions/${sessionId}/cancel`, { reason });
  }

  // Messages endpoints
  async getConversations(): Promise<Conversation[]> {
    const response = await this.client.get('/api/messages/conversations');
    return response.data;
  }

  async getMessages(otherUserId: string, page = 1, pageSize = 50): Promise<Message[]> {
    const response = await this.client.get(`/api/messages/conversation/${otherUserId}`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  async sendMessage(data: {
    receiverId: string;
    content: string;
    sessionId?: number;
    type?: number;
  }): Promise<Message> {
    const response = await this.client.post('/api/messages', data);
    return response.data;
  }

  async markMessagesAsRead(senderId: string): Promise<void> {
    await this.client.post('/api/messages/mark-read', { senderId });
  }

  // Reviews endpoints
  async getUserReviews(userId: string): Promise<Review[]> {
    const response = await this.client.get(`/api/reviews/user/${userId}`);
    return response.data;
  }

  async createReview(data: {
    revieweeId: string;
    sessionId: number;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const response = await this.client.post('/api/reviews', data);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const response = await this.client.get('/api/notifications', {
      params: { unreadOnly }
    });
    return response.data;
  }

  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    const response = await this.client.get('/api/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.client.post(`/api/notifications/${notificationId}/mark-read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.post('/api/notifications/mark-all-read');
  }
}

export const apiClient = new ApiClient();