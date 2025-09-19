import api from './api';
import { UserSkill } from './skillsService';
import { User } from './userService';

export interface Match {
  id: number;
  userId1: string;
  userId2: string;
  skill1Id: number;
  skill2Id: number;
  compatibilityScore: number;
  createdAt: string;
  isViewed: boolean;
}

export interface CreateMatchRequest {
  userId1: string;
  userId2: string;
  skill1Id: number;
  skill2Id: number;
}

class MatchingService {
  async getMyMatches(): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>('/matching/my-matches');
    return response.data;
  }

  async getOfferedForRequest(requestedSkillId: number): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>(`/matching/offered-for-request/${requestedSkillId}`);
    return response.data;
  }

  async getRequestedForOffer(offeredSkillId: number): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>(`/matching/requested-for-offer/${offeredSkillId}`);
    return response.data;
  }

  async getRecommendedSkills(): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>('/matching/recommended-skills');
    return response.data;
  }

  async getRecommendedUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/matching/recommended-users');
    return response.data;
  }
}

export const matchingService = new MatchingService();
