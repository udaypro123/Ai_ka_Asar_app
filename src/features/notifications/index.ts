import { createNotificationService } from './application/notification.service';
import { notificationApiRepository } from './infrastructure/notificationApi.repository';

export const notificationService = createNotificationService(notificationApiRepository);

export {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CHANNELS,
} from './domain/notification.types';
export type {
  Notification,
  NotificationChannel,
  NotificationPreferences,
} from './domain/notification.types';
export { notificationChannelOptions } from './presentation/notificationChannels';
