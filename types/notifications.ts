export type NotificationType = 'period' | 'ovulation' | 'fertile_window' | 'birth_control';

export interface NotificationSettings {
  periodReminders: boolean;
  ovulationReminders: boolean;
  fertileWindowReminders: boolean;
  birthControlReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationTime: string; // HH:MM format for default time
  daysBeforeReminder: number; // Days before period to send reminder
}

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledDate: string; // ISO date string
  isActive: boolean;
  relatedId?: string; // ID of related period, reminder, etc.
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  periodReminders: true,
  ovulationReminders: true,
  fertileWindowReminders: true,
  birthControlReminders: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationTime: '09:00',
  daysBeforeReminder: 1,
};