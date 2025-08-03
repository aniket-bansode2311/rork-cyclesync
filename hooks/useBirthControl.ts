import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BirthControlSettings, 
  BirthControlReminder, 
  BirthControlLog, 
  BirthControlMethod,
  ReminderFrequency 
} from '@/types/birthControl';
import { useNotifications } from '@/hooks/useNotifications';

const BIRTH_CONTROL_STORAGE_KEY = 'birth_control_settings';

const defaultSettings: BirthControlSettings = {
  reminders: [],
  logs: [],
  notificationsEnabled: true,
};

export const useBirthControl = () => {
  const [settings, setSettings] = useState<BirthControlSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get notification functions
  const { scheduleBirthControlReminder, cancelNotificationsByRelatedId } = useNotifications();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(BIRTH_CONTROL_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading birth control settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: BirthControlSettings) => {
    try {
      await AsyncStorage.setItem(BIRTH_CONTROL_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving birth control settings:', error);
    }
  };

  const setCurrentMethod = async (method: BirthControlMethod) => {
    const newSettings = {
      ...settings,
      currentMethod: method,
    };
    await saveSettings(newSettings);
  };

  const addReminder = async (
    method: BirthControlMethod,
    frequency: ReminderFrequency,
    time: string,
    customName?: string,
    notes?: string
  ) => {
    const newReminder: BirthControlReminder = {
      id: Date.now().toString(),
      method,
      frequency,
      time,
      isActive: true,
      customName,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSettings = {
      ...settings,
      reminders: [...settings.reminders, newReminder],
    };
    await saveSettings(newSettings);
    
    // Schedule notifications for this reminder
    await scheduleBirthControlReminder(newReminder);
    
    return newReminder;
  };

  const updateReminder = async (reminderId: string, updates: Partial<BirthControlReminder>) => {
    const updatedReminders = settings.reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, ...updates, updatedAt: new Date().toISOString() }
        : reminder
    );

    const newSettings = {
      ...settings,
      reminders: updatedReminders,
    };
    await saveSettings(newSettings);
    
    // Cancel old notifications and schedule new ones
    await cancelNotificationsByRelatedId(reminderId);
    const updatedReminder = updatedReminders.find(r => r.id === reminderId);
    if (updatedReminder && updatedReminder.isActive) {
      await scheduleBirthControlReminder(updatedReminder);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    const filteredReminders = settings.reminders.filter(reminder => reminder.id !== reminderId);
    const filteredLogs = settings.logs.filter(log => log.reminderId !== reminderId);

    const newSettings = {
      ...settings,
      reminders: filteredReminders,
      logs: filteredLogs,
    };
    await saveSettings(newSettings);
    
    // Cancel notifications for this reminder
    await cancelNotificationsByRelatedId(reminderId);
  };

  const logAdherence = async (reminderId: string, taken: boolean, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Remove existing log for today if it exists
    const filteredLogs = settings.logs.filter(
      log => !(log.reminderId === reminderId && log.date === today)
    );

    const newLog: BirthControlLog = {
      id: Date.now().toString(),
      reminderId,
      date: today,
      taken,
      takenAt: taken ? new Date().toISOString() : undefined,
      notes,
      createdAt: new Date().toISOString(),
    };

    const newSettings = {
      ...settings,
      logs: [...filteredLogs, newLog],
    };
    await saveSettings(newSettings);
    return newLog;
  };

  const getLogForDate = (reminderId: string, date: string): BirthControlLog | undefined => {
    return settings.logs.find(log => log.reminderId === reminderId && log.date === date);
  };

  const getAdherenceStats = (reminderId: string, days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const relevantLogs = settings.logs.filter(log => {
      if (log.reminderId !== reminderId) return false;
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    const takenCount = relevantLogs.filter(log => log.taken).length;
    const totalCount = relevantLogs.length;
    const adherenceRate = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

    return {
      takenCount,
      totalCount,
      adherenceRate: Math.round(adherenceRate),
      logs: relevantLogs,
    };
  };

  const toggleNotifications = async () => {
    const newSettings = {
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled,
    };
    await saveSettings(newSettings);
  };

  return {
    settings,
    isLoading,
    setCurrentMethod,
    addReminder,
    updateReminder,
    deleteReminder,
    logAdherence,
    getLogForDate,
    getAdherenceStats,
    toggleNotifications,
  };
};