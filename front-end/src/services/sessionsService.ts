import api from './api';
import { ErrorHandler } from '../utils/errorHandler';

export interface Session {
  id: number;
  teacherId: string;
  studentId: string;
  userSkillId: number;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  creditsCost: number;
  status: number; // 1=Pending, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled, 6=Disputed
  notes?: string;
  meetingLink?: string;
  isOnline: boolean;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  teacherConfirmed: boolean;
  studentConfirmed: boolean;
  confirmedAt?: string;
  teacher: {
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
  };
  student: {
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
  };
  userSkill: {
    id: number;
    userId: string;
    skillId: number;
    type: 'Offering' | 'Requesting';
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    description?: string;
    requirements?: string;
    creditsPerHour: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt?: string;
    skill: {
      id: number;
      name: string;
      description?: string;
      category: string;
      subCategory?: string;
      isActive: boolean;
      createdAt: string;
    };
    user: {
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
    };
  };
}

export interface CreateSessionRequest {
  teacherId: string;
  userSkillId: number;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
  isOnline: boolean;
  location?: string;
  meetingLink?: string;
}

export interface UpdateSessionRequest {
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string;
  meetingLink?: string;
  isOnline?: boolean;
  location?: string;
}

export interface CancelSessionRequest {
  reason: string;
}

export interface ConfirmSessionRequest {
  confirmed: boolean;
  notes?: string;
}

export interface RescheduleSessionRequest {
  newStart: string;
  newEnd: string;
}

class SessionsService {
  async getMySessions(): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>('/sessions/my-sessions');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async getTeachingSessions(): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>('/sessions/teaching');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async getLearningSessions(): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>('/sessions/learning');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async getSessionById(id: number): Promise<Session> {
    try {
      const response = await api.get<Session>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    try {
      const response = await api.post<Session>('/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async bookSession(sessionData: CreateSessionRequest): Promise<Session> {
    try {
      const response = await api.post<Session>('/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async updateSession(id: number, sessionData: UpdateSessionRequest): Promise<Session> {
    try {
      const response = await api.put<Session>(`/sessions/${id}`, sessionData);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async cancelSession(id: number, cancelData: CancelSessionRequest): Promise<void> {
    try {
      await api.post(`/sessions/${id}/cancel`, cancelData);
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async confirmSession(id: number, confirmData: ConfirmSessionRequest): Promise<void> {
    try {
      await api.post(`/sessions/${id}/confirm`, confirmData);
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async completeSession(id: number): Promise<void> {
    try {
      await api.post(`/sessions/${id}/complete`);
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async rescheduleSession(id: number, rescheduleData: RescheduleSessionRequest): Promise<void> {
    try {
      await api.post(`/sessions/${id}/reschedule`, rescheduleData);
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async getUpcomingSessions(): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>('/sessions/upcoming');
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async getSessionsByStatus(status: number): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>(`/sessions/status/${status}`);
      return response.data;
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  // Additional helper methods for better UX
  async acceptSession(id: number): Promise<void> {
    try {
      await api.post(`/sessions/${id}/confirm`, { confirmed: true });
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }

  async declineSession(id: number): Promise<void> {
    try {
      await api.post(`/sessions/${id}/confirm`, { confirmed: false, notes: "Session declined by instructor" });
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error as any);
    }
  }
}

export const sessionsService = new SessionsService();
