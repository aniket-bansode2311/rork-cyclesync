import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Period, CycleStats, PeriodContextType } from '@/types/period';
import { calculateCycleStats, getPredictedOvulationDate, getPredictedFertileWindow } from '@/utils/periodCalculations';
import { useNotifications } from '@/hooks/useNotifications';
import { secureStorage } from '@/utils/secureStorage';
import { PrivacySettings } from '@/types/privacy';

const PERIODS_STORAGE_KEY = 'periods_data';

export const [PeriodProvider, usePeriods] = createContextHook((): PeriodContextType => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats>({
    averageCycleLength: 28,
    totalPeriods: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useEncryption, setUseEncryption] = useState<boolean>(true);
  
  // Get notification functions
  const { 
    schedulePeriodReminder, 
    scheduleOvulationReminder, 
    scheduleFertileWindowReminder,
    cancelNotificationsByRelatedId 
  } = useNotifications();

  // Load periods from storage on mount
  useEffect(() => {
    loadPrivacySettings();
  }, []);
  
  const loadPrivacySettings = async () => {
    try {
      const privacyData = await secureStorage.getSecureData<PrivacySettings>('privacy_settings', true);
      if (privacyData && privacyData.dataEncryption !== undefined) {
        setUseEncryption(privacyData.dataEncryption);
      }
    } catch (error) {
      console.log('Privacy settings not found, using default encryption');
    }
    loadPeriods();
  };

  // Recalculate stats and schedule notifications when periods change
  useEffect(() => {
    const stats = calculateCycleStats(periods);
    setCycleStats(stats);
    
    // Schedule notifications for predictions
    if (periods.length > 0) {
      scheduleNotificationsForPredictions();
    }
  }, [periods]);

  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      
      // Try secure storage first if encryption is enabled
      if (useEncryption) {
        const secureData = await secureStorage.getSecureData<Period[]>(PERIODS_STORAGE_KEY, true);
        if (secureData) {
          setPeriods(secureData);
          return;
        }
      }
      
      // Fallback to AsyncStorage
      const storedPeriods = await AsyncStorage.getItem(PERIODS_STORAGE_KEY);
      if (storedPeriods) {
        const parsedPeriods: Period[] = JSON.parse(storedPeriods);
        setPeriods(parsedPeriods);
        
        // Migrate to secure storage if encryption is enabled
        if (useEncryption) {
          await secureStorage.setSecureData(PERIODS_STORAGE_KEY, parsedPeriods, true);
          await AsyncStorage.removeItem(PERIODS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePeriods = async (newPeriods: Period[]) => {
    try {
      if (useEncryption) {
        await secureStorage.setSecureData(PERIODS_STORAGE_KEY, newPeriods, true);
      } else {
        await AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(newPeriods));
      }
    } catch (error) {
      console.error('Error saving periods:', error);
    }
  };

  const addPeriod = (periodData: Omit<Period, 'id'>) => {
    const newPeriod: Period = {
      ...periodData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    savePeriods(updatedPeriods);
  };

  const updatePeriod = (id: string, updates: Partial<Period>) => {
    const updatedPeriods = periods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    );
    setPeriods(updatedPeriods);
    savePeriods(updatedPeriods);
  };

  const deletePeriod = (id: string) => {
    const updatedPeriods = periods.filter(period => period.id !== id);
    setPeriods(updatedPeriods);
    savePeriods(updatedPeriods);
    
    // Cancel notifications for this period
    cancelNotificationsByRelatedId(id);
  };
  
  const scheduleNotificationsForPredictions = async () => {
    try {
      // Schedule period reminder
      if (cycleStats.nextPredictedPeriod) {
        const nextPeriodDate = new Date(cycleStats.nextPredictedPeriod);
        const mockPeriod: Period = {
          id: 'predicted_period',
          startDate: cycleStats.nextPredictedPeriod,
        };
        await schedulePeriodReminder(mockPeriod, nextPeriodDate);
      }
      
      // Schedule ovulation reminder
      const ovulationDate = getPredictedOvulationDate(periods);
      if (ovulationDate) {
        await scheduleOvulationReminder(ovulationDate);
      }
      
      // Schedule fertile window reminder
      const fertileWindow = getPredictedFertileWindow(periods);
      if (fertileWindow) {
        await scheduleFertileWindowReminder(fertileWindow.start);
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  return {
    periods,
    cycleStats,
    addPeriod,
    updatePeriod,
    deletePeriod,
    isLoading,
  };
});