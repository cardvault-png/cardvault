import api from './api';

export const giftCardService = {
  async getRates(params?: any) {
    const response = await api.get('/giftcards/rates', { params });
    return response.data.data;
  },

  async getMyCards(params?: any) {
    const response = await api.get('/giftcards/my-cards', { params });
    return response.data.data;
  },

  async submitGiftCard(formData: FormData) {
    const response = await api.post('/giftcards/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getGiftCard(id: string) {
    const response = await api.get(`/giftcards/${id}`);
    return response.data.data;
  },
};
