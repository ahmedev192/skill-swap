import api from './api';

export interface Match {
  id: number;
  userId1: string;
  userId2: string;
  skill1Id: number;
  skill2Id: number;
  compatibilityScore: number;
  createdAt: string;
  isViewed: boolean;
  user1: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  skill1: {
    id: number;
    name: string;
    description: string;
  };
  skill2: {
    id: number;
    name: string;
    description: string;
  };
}

export interface CreateMatchRequest {
  userId1: string;
  userId2: string;
  skill1Id: number;
  skill2Id: number;
}

class MatchingService {
  async getMatches(userId: string): Promise<Match[]> {
    const response = await api.get<Match[]>(`/matching/user/${userId}`);
    return response.data;
  }

  async getUnviewedMatches(userId: string): Promise<Match[]> {
    const response = await api.get<Match[]>(`/matching/user/${userId}/unviewed`);
    return response.data;
  }

  async getMatchById(id: number): Promise<Match> {
    const response = await api.get<Match>(`/matching/${id}`);
    return response.data;
  }

  async markAsViewed(id: number): Promise<void> {
    await api.put(`/matching/${id}/viewed`);
  }

  async createMatch(matchData: CreateMatchRequest): Promise<Match> {
    const response = await api.post<Match>('/matching', matchData);
    return response.data;
  }

  async deleteMatch(id: number): Promise<void> {
    await api.delete(`/matching/${id}`);
  }

  async findMatches(userId: string): Promise<Match[]> {
    const response = await api.post<Match[]>(`/matching/find-matches/${userId}`);
    return response.data;
  }

  async getCompatibilityScore(userId1: string, userId2: string): Promise<{ score: number }> {
    const response = await api.get<{ score: number }>(`/matching/compatibility/${userId1}/${userId2}`);
    return response.data;
  }
}

export const matchingService = new MatchingService();
