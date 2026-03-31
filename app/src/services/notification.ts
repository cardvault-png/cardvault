import api from './api';

export const notificationService = {
  async getNotifications(page = 1, limit = 20) {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  },

  async markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string) {
    await api.delete(`/notifications/${id}`);
  },
};
