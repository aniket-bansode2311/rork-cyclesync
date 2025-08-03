import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType, ScheduledNotification } from '@/types/notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleNotification(
    id: string,
    title: string,
    body: string,
    scheduledDate: Date,
    type: NotificationType,
    relatedId?: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Scheduling notification on web (placeholder):', { id, title, body, scheduledDate });
      return id;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      // Cancel existing notification with same ID
      await this.cancelNotification(id);

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title,
          body,
          sound: true,
          data: {
            type,
            relatedId,
            customId: id,
          },
        },
        trigger: scheduledDate,
      });

      console.log(`Scheduled notification: ${title} for ${scheduledDate.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Canceling notification on web (placeholder):', id);
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log(`Canceled notification: ${id}`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Canceling all notifications on web (placeholder)');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Canceled all notifications');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      console.log('Getting scheduled notifications on web (placeholder)');
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Helper methods for specific notification types
  static generatePeriodNotificationId(periodId: string): string {
    return `period_${periodId}`;
  }

  static generateOvulationNotificationId(date: string): string {
    return `ovulation_${date}`;
  }

  static generateFertileWindowNotificationId(date: string): string {
    return `fertile_window_${date}`;
  }

  static generateBirthControlNotificationId(reminderId: string): string {
    return `birth_control_${reminderId}`;
  }

  // Calculate next occurrence for recurring notifications
  static getNextOccurrence(time: string, frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const nextDate = new Date();
    
    nextDate.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, move to next occurrence
    if (nextDate <= now) {
      switch (frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
      }
    }
    
    return nextDate;
  }
}