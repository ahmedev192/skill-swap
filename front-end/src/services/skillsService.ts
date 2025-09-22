import api from './api';
import { ErrorHandler } from '../utils/errorHandler';

export interface Skill {
  id: number;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserSkill {
  id: number;
  userId: string;
  skillId: number;
  skill: Skill;
  level: number; // 1=Beginner, 2=Intermediate, 3=Expert
  type: number; // 1=Offered, 2=Requested
  description?: string;
  requirements?: string;
  creditsPerHour: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserSkillRequest {
  skillId: number;
  level: number; // 1=Beginner, 2=Intermediate, 3=Expert
  type: number; // 1=Offered, 2=Requested
  description?: string;
  requirements?: string;
  creditsPerHour: number;
}

export interface UpdateUserSkillRequest {
  level?: number; // 1=Beginner, 2=Intermediate, 3=Expert
  description?: string;
  requirements?: string;
  creditsPerHour?: number;
  isAvailable?: boolean;
}

export interface CreateSkillRequest {
  name: string;
  description: string;
  category: string;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

class SkillsService {
  async getAllSkills(): Promise<Skill[]> {
    try {
      const response = await api.get<Skill[]>('/skills');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to get skills');
    }
  }

  async getSkillById(id: number): Promise<Skill> {
    const response = await api.get<Skill>(`/skills/${id}`);
    return response.data;
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const response = await api.get<Skill[]>(`/skills/category/${category}`);
    return response.data;
  }

  async createSkill(skillData: CreateSkillRequest): Promise<Skill> {
    const response = await api.post<Skill>('/skills', skillData);
    return response.data;
  }

  async updateSkill(id: number, skillData: UpdateSkillRequest): Promise<Skill> {
    const response = await api.put<Skill>(`/skills/${id}`, skillData);
    return response.data;
  }

  async deleteSkill(id: number): Promise<void> {
    await api.delete(`/skills/${id}`);
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    try {
      const response = await api.get<UserSkill[]>(`/skills/user/${userId}`);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to get user skills');
    }
  }

  async getUserSkillById(userSkillId: number): Promise<UserSkill> {
    const response = await api.get<UserSkill>(`/skills/user-skill/${userSkillId}`);
    return response.data;
  }

  async getOfferedSkills(userId: string): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>(`/skills/user/${userId}/offered`);
    return response.data;
  }

  async getRequestedSkills(userId: string): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>(`/skills/user/${userId}/requested`);
    return response.data;
  }

  async createUserSkill(userSkillData: CreateUserSkillRequest): Promise<UserSkill> {
    try {
      const response = await api.post<UserSkill>('/skills/user', userSkillData);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to create user skill');
    }
  }

  async updateUserSkill(userSkillId: number, userSkillData: UpdateUserSkillRequest): Promise<UserSkill> {
    try {
      const response = await api.put<UserSkill>(`/skills/user/${userSkillId}`, userSkillData);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to update user skill');
    }
  }

  async deleteUserSkill(userSkillId: number): Promise<void> {
    try {
      await api.delete(`/skills/user/${userSkillId}`);
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to delete user skill');
    }
  }

  async searchSkills(searchTerm?: string, category?: string, location?: string, level?: string, type?: string): Promise<UserSkill[]> {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (level) params.append('level', level);
      if (type) params.append('type', type);
      
      const response = await api.get<UserSkill[]>(`/skills/search?${params}`);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to search skills');
    }
  }

  async getAllOfferedSkills(): Promise<UserSkill[]> {
    try {
      const response = await api.get<UserSkill[]>('/skills/offered');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to get offered skills');
    }
  }

  async getAllAvailableUserSkills(): Promise<UserSkill[]> {
    try {
      const response = await api.get<UserSkill[]>('/skills/available');
      return response.data;
    } catch (error) {
      // If endpoint fails, fallback to search
      console.warn('Could not load all available skills, falling back to search:', error);
      try {
        const response = await api.get<UserSkill[]>('/skills/search?searchTerm=a');
        return response.data;
      } catch (searchError) {
        console.warn('Could not load all available user skills:', searchError);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    }
  }
}

export const skillsService = new SkillsService();
