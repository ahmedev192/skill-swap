import api from './api';

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

class ReviewsService {
  async getReviewsByUser(userId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/user/${userId}`);
    return response.data;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/user/${userId}`);
    return response.data;
  }

  async getMyReviews(): Promise<Review[]> {
    const response = await api.get<Review[]>('/reviews/my-reviews');
    return response.data;
  }

  async getReviewById(id: number): Promise<Review> {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>('/reviews', reviewData);
    return response.data;
  }

  async updateReview(id: number, reviewData: UpdateReviewRequest): Promise<Review> {
    const response = await api.put<Review>(`/reviews/${id}`, reviewData);
    return response.data;
  }

  async deleteReview(id: number): Promise<void> {
    await api.delete(`/reviews/${id}`);
  }

  async getSessionReviews(sessionId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/session/${sessionId}`);
    return response.data;
  }

  async getUserRating(userId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const response = await api.get<{ averageRating: number; reviewCount: number }>(`/reviews/user/${userId}/rating`);
    return response.data;
  }
}

export const reviewsService = new ReviewsService();
