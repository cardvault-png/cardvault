import api from './api';

export const transactionService = {
  async getTransactions(params?: any) {
    const response = await api.get('/transactions', { params });
    return response.data.data;
  },

  async getTransaction(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },

  async createWithdrawal(data: {
    walletType: string;
    amount: number;
    bankAccountId: string;
  }) {
    const response = await api.post('/transactions/withdrawal', data);
    return response.data.data;
  },

  async disputeTransaction(id: string, data: { reason: string; evidence?: string }) {
    const response = await api.post(`/transactions/${id}/dispute`, data);
    return response.data.data;
  },
};
