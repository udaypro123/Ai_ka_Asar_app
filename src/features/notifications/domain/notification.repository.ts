import type { Notification } from './notification.types';

export interface NotificationRepository {
  getAll(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification>;
}
