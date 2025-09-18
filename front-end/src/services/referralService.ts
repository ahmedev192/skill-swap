import api from './api';

export interface ReferralStats {
  referralCode: string;
  referredUsersCount: number;
  totalCreditsEarned: number;
  hasUsedReferral: boolean;
}

export interface UseReferralResponse {
  message: string;
  creditsEarned: number;
}

class ReferralService {
  async generateReferralCode(): Promise<string> {
    const response = await api.post<{ referralCode: string }>('/users/referral/generate');
    return response.data.referralCode;
  }

  async useReferralCode(referralCode: string): Promise<UseReferralResponse> {
    const response = await api.post<UseReferralResponse>('/users/referral/use', {
      referralCode
    });
    return response.data;
  }

  async getReferralStats(): Promise<ReferralStats> {
    const response = await api.get<ReferralStats>('/users/referral/stats');
    return response.data;
  }
}

export const referralService = new ReferralService();
