import api from './api';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
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
    const response = await api.get<Skill[]>('/skills');
    return response.data;
  }

  async getSkillById(id: string): Promise<Skill> {
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

  async updateSkill(id: string, skillData: UpdateSkillRequest): Promise<Skill> {
    const response = await api.put<Skill>(`/skills/${id}`, skillData);
    return response.data;
  }

  async deleteSkill(id: string): Promise<void> {
    await api.delete(`/skills/${id}`);
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>(`/skills/user/${userId}`);
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
    const response = await api.post<UserSkill>('/skills/user', userSkillData);
    return response.data;
  }

  async updateUserSkill(userSkillId: string, userSkillData: UpdateUserSkillRequest): Promise<UserSkill> {
    const response = await api.put<UserSkill>(`/skills/user/${userSkillId}`, userSkillData);
    return response.data;
  }

  async deleteUserSkill(userSkillId: string): Promise<void> {
    await api.delete(`/skills/user/${userSkillId}`);
  }

  async searchSkills(searchTerm: string, category?: string, location?: string): Promise<UserSkill[]> {
    const params = new URLSearchParams({ searchTerm });
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    
    const response = await api.get<UserSkill[]>(`/skills/search?${params}`);
    return response.data;
  }

  async getAllAvailableUserSkills(): Promise<UserSkill[]> {
    // Since the backend doesn't have an endpoint to get all available user skills,
    // we'll use a broad search term to get a good selection of skills
    // This is a workaround until a proper endpoint is implemented
    try {
      const response = await api.get<UserSkill[]>('/skills/search?searchTerm=a');
      return response.data;
    } catch (error) {
      // If search fails, return empty array
      console.warn('Could not load all available user skills:', error);
      return [];
    }
  }
}

export const skillsService = new SkillsService();
