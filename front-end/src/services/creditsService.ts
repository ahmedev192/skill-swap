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
    // This endpoint doesn't exist in the backend
    throw new Error('Transaction details endpoint not implemented');
  }

  async transferCredits(transferData: TransferCreditsRequest): Promise<CreditTransaction> {
    // This endpoint doesn't exist in the backend
    throw new Error('Credit transfer endpoint not implemented');
  }

  async addCredits(userId: string, amount: number, description: string): Promise<CreditTransaction> {
    // This endpoint doesn't exist in the backend
    throw new Error('Add credits endpoint not implemented');
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<CreditTransaction> {
    // This endpoint doesn't exist in the backend
    throw new Error('Deduct credits endpoint not implemented');
  }

  async getPendingTransactions(userId: string): Promise<CreditTransaction[]> {
    // This endpoint doesn't exist in the backend
    console.warn('Pending transactions endpoint not available');
    return [];
  }

  async cancelTransaction(id: number): Promise<void> {
    // This endpoint doesn't exist in the backend
    throw new Error('Cancel transaction endpoint not implemented');
  }
}

export const creditsService = new CreditsService();
