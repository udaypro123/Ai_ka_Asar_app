import type { NotificationChannel } from '../domain/notification.types';

export interface NotificationChannelOption {
  channel: NotificationChannel;
  title: string;
  description: string;
}

export const notificationChannelOptions: readonly NotificationChannelOption[] = [
  {
    channel: 'email',
    title: 'Email',
    description: 'Receive account notifications by email.',
  },
  {
    channel: 'sms',
    title: 'SMS',
    description: 'Receive notifications by text message.',
  },
  {
    channel: 'whatsapp',
    title: 'WhatsApp',
    description: 'Receive notifications through WhatsApp.',
  },
];
