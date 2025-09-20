import api from './api';
import { ErrorHandler } from '../utils/errorHandler';

export interface Review {
  id: number;
  reviewerId: string;
  revieweeId: string;
  sessionId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  isVisible: boolean;
  reviewer: {
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
  reviewee: {
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
  session: {
    id: number;
    teacherId: string;
    studentId: string;
    userSkillId: number;
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    creditsCost: number;
    status: number;
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
    userSkill?: {
      skill?: {
        name: string;
      };
    };
    teacher?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateReviewRequest {
  revieweeId: string;
  sessionId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface UserRating {
  averageRating: number;
  reviewCount: number;
}

class ReviewsService {
  async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(`/reviews/user/${userId}`);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getReviewsByUser');
      throw errorResult;
    }
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(`/reviews/user/${userId}`);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getReviewsForUser');
      throw errorResult;
    }
  }

  async getMyReviews(): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getMyReviews');
      throw errorResult;
    }
  }

  async getReviewById(id: number): Promise<Review> {
    try {
      const response = await api.get<Review>(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getReviewById');
      throw errorResult;
    }
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    try {
      const response = await api.post<Review>('/reviews', reviewData);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'createReview');
      throw errorResult;
    }
  }

  async updateReview(id: number, reviewData: UpdateReviewRequest): Promise<Review> {
    try {
      const response = await api.put<Review>(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'updateReview');
      throw errorResult;
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      await api.delete(`/reviews/${id}`);
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'deleteReview');
      throw errorResult;
    }
  }

  async getSessionReviews(sessionId: number): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(`/reviews/session/${sessionId}`);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getSessionReviews');
      throw errorResult;
    }
  }

  async getUserRating(userId: string): Promise<UserRating> {
    try {
      const response = await api.get<UserRating>(`/reviews/user/${userId}/rating`);
      return response.data;
    } catch (error) {
      const errorResult = ErrorHandler.fromAxiosError(error as any);
      ErrorHandler.logError(errorResult, 'getUserRating');
      throw errorResult;
    }
  }
}

export const reviewsService = new ReviewsService();
