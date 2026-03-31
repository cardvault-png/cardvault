import api from './api';

export const bankService = {
  async getBanks(country: string) {
    const response = await api.get(`/bank/banks/${country}`);
    return response.data.data;
  },

  async verifyAccount(bankCode: string, accountNumber: string) {
    const response = await api.post('/bank/verify-account', {
      bankCode,
      accountNumber,
    });
    return response.data.data;
  },

  async getAccounts() {
    const response = await api.get('/bank/accounts');
    return response.data.data;
  },

  async addAccount(data: {
    country: string;
    bankName: string;
    bankCode?: string;
    accountNumber: string;
    accountName: string;
    isDefault?: boolean;
  }) {
    const response = await api.post('/bank/accounts', data);
    return response.data.data;
  },

  async updateAccount(id: string, data: { isDefault?: boolean }) {
    const response = await api.patch(`/bank/accounts/${id}`, data);
    return response.data.data;
  },

  async deleteAccount(id: string) {
    await api.delete(`/bank/accounts/${id}`);
  },
};
