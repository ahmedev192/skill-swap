import api from './api';

export interface ReferralStats {
  referralCode: string;
  referredUsersCount: number;
  totalCreditsEarned: number;
  hasUsedReferral: boolean;
}

export interface UseReferralCodeDto {
  referralCode: string;
}

export interface ReferralResult {
  success: boolean;
  message: string;
  creditsEarned?: number;
}

class ReferralService {
  /**
   * Generate a referral code for the current user
   */
  async generateReferralCode(): Promise<{ referralCode: string }> {
    const response = await api.post('/users/referral/generate');
    return response.data;
  }

  /**
   * Use a referral code
   */
  async useReferralCode(referralCode: string): Promise<ReferralResult> {
    const response = await api.post('/users/referral/use', { referralCode });
    return response.data;
  }

  /**
   * Get referral statistics for the current user
   */
  async getReferralStats(): Promise<ReferralStats> {
    const response = await api.get('/users/referral/stats');
    return response.data;
  }

  /**
   * Copy referral code to clipboard
   */
  async copyReferralCode(referralCode: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(referralCode);
      return true;
    } catch (error) {
      console.error('Failed to copy referral code:', error);
      return false;
    }
  }

  /**
   * Generate referral link
   */
  generateReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralCode}`;
  }
}

export const referralService = new ReferralService();