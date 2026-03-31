import api from './api';

export const adminService = {
  async login(email: string, password: string, accessCode: string) {
    const response = await api.post('/admin/login', { email, password, accessCode });
    return response.data.data;
  },

  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  async getUsers(params?: any) {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  async getUser(id: string) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  async banUser(id: string, ban: boolean, reason?: string) {
    const response = await api.post(`/admin/users/${id}/ban`, { ban, reason });
    return response.data.data;
  },

  async adjustBalance(id: string, data: { walletType: string; amount: number; reason: string }) {
    const response = await api.post(`/admin/users/${id}/adjust-balance`, data);
    return response.data.data;
  },

  async getPendingTransactions(params?: any) {
    const response = await api.get('/admin/transactions/pending', { params });
    return response.data.data;
  },

  async approveTransaction(id: string, approve: boolean, reason?: string) {
    const response = await api.post(`/admin/transactions/${id}/approve`, { approve, reason });
    return response.data.data;
  },

  async getPendingGiftCards(params?: any) {
    const response = await api.get('/admin/giftcards/pending', { params });
    return response.data.data;
  },

  async approveGiftCard(id: string, approve: boolean, reason?: string) {
    const response = await api.post(`/admin/giftcards/${id}/approve`, { approve, reason });
    return response.data.data;
  },

  async getPendingKyc(params?: any) {
    const response = await api.get('/admin/kyc/pending', { params });
    return response.data.data;
  },

  async approveKyc(id: string, approve: boolean, reason?: string) {
    const response = await api.post(`/admin/kyc/${id}/approve`, { approve, reason });
    return response.data.data;
  },

  async getAdminWallet() {
    const response = await api.get('/admin/wallet');
    return response.data.data;
  },

  async sendFunds(data: { userId: string; walletType: string; amount: number; reason: string }) {
    const response = await api.post('/admin/send-funds', data);
    return response.data.data;
  },

  async broadcast(data: { title: string; message: string; actionUrl?: string }) {
    const response = await api.post('/admin/broadcast', data);
    return response.data.data;
  },
};
