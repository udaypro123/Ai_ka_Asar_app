import api from '../../../config/api';
import type { NotificationRepository } from '../domain/notification.repository';
import type { Notification } from '../domain/notification.types';

export const notificationApiRepository: NotificationRepository = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
  },
};
