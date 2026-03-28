import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { NotificationSettings, ScheduledNotification, DEFAULT_NOTIFICATION_SETTINGS } from '@/types/notifications';
import { NotificationService } from '@/utils/notificationService';
import { Period } from '@/types/period';
import { BirthControlReminder } from '@/types/birthControl';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
    loadScheduledNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setScheduledNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const saveScheduledNotifications = async (notifications: ScheduledNotification[]) => {
    try {
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  };

  const schedulePeriodReminder = async (period: Period, predictedStartDate: Date) => {
    if (!settings.periodReminders) return;

    const notificationId = NotificationService.generatePeriodNotificationId(period.id);
    const title = 'Period Reminder';
    const body = 'Your period is expected to start today. Don\'t forget to track it!';
    
    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    const scheduledDate = new Date(predictedStartDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const systemNotificationId = await NotificationService.scheduleNotification(
      notificationId,
      title,
      body,
      scheduledDate,
      'period',
      period.id
    );

    if (systemNotificationId) {
      const notification: ScheduledNotification = {
        id: notificationId,
        type: 'period',
        title,
        body,
        scheduledDate: scheduledDate.toISOString(),
        isActive: true,
        relatedId: period.id,
      };

      const updatedNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      updatedNotifications.push(notification);
      await saveScheduledNotifications(updatedNotifications);
    }
  };

  const scheduleOvulationReminder = async (ovulationDate: Date) => {
    if (!settings.ovulationReminders) return;

    const dateStr = ovulationDate.toISOString().split('T')[0];
    const notificationId = NotificationService.generateOvulationNotificationId(dateStr);
    const title = 'Ovulation Day';
    const body = 'Today is your predicted ovulation day. Your fertility is at its peak!';
    
    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    const scheduledDate = new Date(ovulationDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const systemNotificationId = await NotificationService.scheduleNotification(
      notificationId,
      title,
      body,
      scheduledDate,
      'ovulation',
      dateStr
    );

    if (systemNotificationId) {
      const notification: ScheduledNotification = {
        id: notificationId,
        type: 'ovulation',
        title,
        body,
        scheduledDate: scheduledDate.toISOString(),
        isActive: true,
        relatedId: dateStr,
      };

      const updatedNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      updatedNotifications.push(notification);
      await saveScheduledNotifications(updatedNotifications);
    }
  };

  const scheduleFertileWindowReminder = async (fertileWindowStart: Date) => {
    if (!settings.fertileWindowReminders) return;

    const dateStr = fertileWindowStart.toISOString().split('T')[0];
    const notificationId = NotificationService.generateFertileWindowNotificationId(dateStr);
    const title = 'Fertile Window Started';
    const body = 'Your fertile window has begun. This is the best time to conceive!';
    
    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    const scheduledDate = new Date(fertileWindowStart);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const systemNotificationId = await NotificationService.scheduleNotification(
      notificationId,
      title,
      body,
      scheduledDate,
      'fertile_window',
      dateStr
    );

    if (systemNotificationId) {
      const notification: ScheduledNotification = {
        id: notificationId,
        type: 'fertile_window',
        title,
        body,
        scheduledDate: scheduledDate.toISOString(),
        isActive: true,
        relatedId: dateStr,
      };

      const updatedNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      updatedNotifications.push(notification);
      await saveScheduledNotifications(updatedNotifications);
    }
  };

  const scheduleBirthControlReminder = async (reminder: BirthControlReminder) => {
    if (!settings.birthControlReminders) return;

    const notificationId = NotificationService.generateBirthControlNotificationId(reminder.id);
    const title = 'Birth Control Reminder';
    const body = `Time to take your ${reminder.method}`;
    
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    if (scheduledDate <= new Date()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const systemNotificationId = await NotificationService.scheduleNotification(
      notificationId,
      title,
      body,
      scheduledDate,
      'birth_control',
      reminder.id
    );

    if (systemNotificationId) {
      const notification: ScheduledNotification = {
        id: notificationId,
        type: 'birth_control',
        title,
        body,
        scheduledDate: scheduledDate.toISOString(),
        isActive: true,
        relatedId: reminder.id,
      };

      const updatedNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      updatedNotifications.push(notification);
      await saveScheduledNotifications(updatedNotifications);
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await NotificationService.cancelNotification(notificationId);
      
      const updatedNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      await saveScheduledNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await NotificationService.cancelAllNotifications();
      await saveScheduledNotifications([]);
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  const rescheduleAllNotifications = async () => {
    try {
      await NotificationService.cancelAllNotifications();
      await saveScheduledNotifications([]);
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  };

  return {
    settings,
    scheduledNotifications,
    isLoading,
    updateSettings,
    schedulePeriodReminder,
    scheduleOvulationReminder,
    scheduleFertileWindowReminder,
    scheduleBirthControlReminder,
    cancelNotification,
    cancelAllNotifications,
    rescheduleAllNotifications,
  };
});