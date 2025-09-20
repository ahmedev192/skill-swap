import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  timeZone?: string;
  preferredLanguage?: string;
  referralCode?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

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
  customAvatarUrl?: string;
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
  dateOfBirth?: string;
  profileImageUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with:', credentials.email);
    console.log('API URL:', api.defaults.baseURL);
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('Attempting registration with:', userData.email);
    console.log('API URL:', api.defaults.baseURL);
    const response = await api.post<AuthResponse>('/auth/register', userData);
    console.log('Registration response:', response.data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  }

  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>('/users/me', userData);
    return response.data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await api.post('/users/change-password', passwordData);
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(userId: string, token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      userId,
      token,
      newPassword,
    });
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    await api.post('/auth/verify-email', { userId, token });
  }
}

export const authService = new AuthService();
