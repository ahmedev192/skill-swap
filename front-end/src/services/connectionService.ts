import api from './api';

export interface UserConnection {
  id: number;
  requesterId: string;
  receiverId: string;
  status: number;
  statusText: string;
  createdAt: string;
  respondedAt?: string;
  message?: string;
  requester?: User;
  receiver?: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface CreateConnectionRequest {
  receiverId: string;
  message?: string;
}

export interface RespondToConnection {
  connectionId: number;
  status: number; // 2 = Accepted, 3 = Declined
}

export interface ConnectionStats {
  totalConnections: number;
  pendingRequests: number;
  pendingSent: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  hasPendingRequest: boolean;
}

class ConnectionService {
  async sendConnectionRequest(request: CreateConnectionRequest): Promise<UserConnection> {
    const response = await api.post<UserConnection>('/connection/send-request', request);
    return response.data;
  }

  async respondToConnectionRequest(response: RespondToConnection): Promise<UserConnection> {
    const apiResponse = await api.post<UserConnection>('/connection/respond', response);
    return apiResponse.data;
  }

  async getConnectionRequests(): Promise<UserConnection[]> {
    const response = await api.get<UserConnection[]>('/connection/requests');
    return response.data;
  }

  async getSentConnectionRequests(): Promise<UserConnection[]> {
    const response = await api.get<UserConnection[]>('/connection/sent-requests');
    return response.data;
  }

  async getConnections(): Promise<UserConnection[]> {
    const response = await api.get<UserConnection[]>('/connection/connections');
    return response.data;
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    const response = await api.get<ConnectionStats>('/connection/stats');
    return response.data;
  }

  async removeConnection(connectionId: number): Promise<void> {
    await api.delete(`/connection/${connectionId}`);
  }

  async blockUser(targetUserId: string): Promise<void> {
    await api.post(`/connection/block/${targetUserId}`);
  }

  async unblockUser(targetUserId: string): Promise<void> {
    await api.post(`/connection/unblock/${targetUserId}`);
  }

  async checkConnectionStatus(targetUserId: string): Promise<ConnectionStatus> {
    const response = await api.get<ConnectionStatus>(`/connection/check/${targetUserId}`);
    return response.data;
  }

  async searchConnections(searchTerm: string): Promise<UserConnection[]> {
    const response = await api.get<UserConnection[]>(`/connection/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  }
}

export const connectionService = new ConnectionService();
