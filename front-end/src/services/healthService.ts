import api from './api';

class HealthService {
  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      console.log('Testing API connection...');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Full URL:', `${api.defaults.baseURL}/health`);
      
      const response = await api.get('/health');
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Health check failed:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error config:', error.config);
      console.error('Error response:', error.response);
      throw error;
    }
  }
}

export const healthService = new HealthService();
