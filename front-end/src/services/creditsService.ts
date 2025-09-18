import api from './api';

export interface CreditTransaction {
  id: number;
  fromUserId?: string;
  toUserId?: string;
  amount: number;
  type: 'Earned' | 'Spent' | 'Transfer' | 'Bonus' | 'Refund';
  status: 'Pending' | 'Completed' | 'Cancelled';
  sessionId?: number;
  description: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreditBalance {
  balance: number;
  earned: number;
  spent: number;
  pending: number;
}

export interface TransferCreditsRequest {
  toUserId: string;
  amount: number;
  description: string;
}

class CreditsService {
  async getUserCredits(userId: string): Promise<CreditBalance> {
    const response = await api.get<{ balance: number }>(`/users/${userId}/credits`);
    // Transform the API response to match the expected CreditBalance interface
    return {
      balance: response.data.balance,
      earned: 0, // Not available from API
      spent: 0, // Not available from API
      pending: 0 // Not available from API
    };
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    try {
      const response = await api.get<CreditTransaction[]>(`/users/${userId}/credits/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<CreditTransaction> {
    const response = await api.get<CreditTransaction>(`/users/credits/transactions/${id}`);
    return response.data;
  }

  async transferCredits(transferData: TransferCreditsRequest): Promise<CreditTransaction> {
    const response = await api.post<CreditTransaction>('/users/credits/transfer', transferData);
    return response.data;
  }

  async addCredits(userId: string, amount: number, description: string): Promise<CreditTransaction> {
    const response = await api.post<CreditTransaction>(`/users/${userId}/credits/add`, {
      amount,
      description
    });
    return response.data;
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<CreditTransaction> {
    const response = await api.post<CreditTransaction>(`/users/${userId}/credits/deduct`, {
      amount,
      description
    });
    return response.data;
  }

  async getPendingTransactions(userId: string): Promise<CreditTransaction[]> {
    const response = await api.get<CreditTransaction[]>(`/users/${userId}/credits/pending`);
    return response.data;
  }

  async cancelTransaction(id: number): Promise<void> {
    await api.post(`/users/credits/transactions/${id}/cancel`);
  }
}

export const creditsService = new CreditsService();
