import api from './api';

export interface OnlineUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  connectedAt: string;
  lastSeen: string;
}

export interface OnlineUsersResponse {
  onlineUsers: OnlineUser[];
  count: number;
}

class OnlineUsersService {
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const response = await api.get<OnlineUsersResponse>('/users/online');
    return response.data;
  }
}

export const onlineUsersService = new OnlineUsersService();
