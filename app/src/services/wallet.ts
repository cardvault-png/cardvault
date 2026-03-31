import api from './api';

export const walletService = {
  async getWallets() {
    const response = await api.get('/wallet');
    return response.data.data;
  },

  async getWallet(type: string) {
    const response = await api.get(`/wallet/${type}`);
    return response.data.data;
  },

  async getDepositAddress(type: string) {
    const response = await api.get(`/wallet/${type}/deposit-address`);
    return response.data.data;
  },

  async getTransactions(type: string, params?: any) {
    const response = await api.get(`/wallet/${type}/transactions`, { params });
    return response.data.data;
  },

  async getLedger(type: string, params?: any) {
    const response = await api.get(`/wallet/${type}/ledger`, { params });
    return response.data.data;
  },
};
