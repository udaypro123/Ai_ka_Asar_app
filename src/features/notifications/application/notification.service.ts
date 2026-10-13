import type { NotificationRepository } from '../domain/notification.repository';

export const createNotificationService = (repository: NotificationRepository) => ({
  getAll: () => repository.getAll(),
  markAsRead: (notificationId: string) => repository.markAsRead(notificationId),
});
