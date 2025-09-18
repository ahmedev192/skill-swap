import api from './api';

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  content: string;
  createdAt: string;
  session?: {
    id: string;
    userSkill: {
      skill: {
        name: string;
        category: string;
      };
    };
    teacher: {
      firstName: string;
      lastName: string;
    };
    scheduledStart: string;
    notes?: string;
  };
}

export interface CreateReviewRequest {
  sessionId: string;
  revieweeId: string;
  rating: number;
  content: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
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

  async getReviewById(id: string): Promise<Review> {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>('/reviews', reviewData);
    return response.data;
  }

  async updateReview(id: string, reviewData: UpdateReviewRequest): Promise<Review> {
    const response = await api.put<Review>(`/reviews/${id}`, reviewData);
    return response.data;
  }

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  }

  async getSessionReviews(sessionId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/session/${sessionId}`);
    return response.data;
  }

  async getUserRating(userId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const response = await api.get<{ averageRating: number; reviewCount: number }>(`/reviews/user/${userId}/rating`);
    return response.data;
  }
}

export const reviewsService = new ReviewsService();
