import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Period, CycleStats, PeriodContextType } from '@/types/period';
import { calculateCycleStats, getPredictedOvulationDate, getPredictedFertileWindow } from '@/utils/periodCalculations';
import { useNotifications } from '@/hooks/useNotifications';
import { secureStorage } from '@/utils/secureStorage';
import { PrivacySettings } from '@/types/privacy';
import SupabaseService from '@/lib/supabaseService';
import { useAuth } from '@/hooks/useAuth';

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

  const { user, isAuthenticated } = useAuth();

  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        // Load from Supabase
        try {
          const cycles = await SupabaseService.getUserCycles(user.id);
          const periodLogs = await SupabaseService.getUserPeriodLogs(user.id);
          
          // Convert Supabase data to Period format
          const supabasePeriods: Period[] = cycles.map(cycle => ({
            id: cycle.id,
            startDate: cycle.start_date,
            endDate: cycle.end_date || undefined,
            flow: 'medium', // Default flow, can be enhanced
            symptoms: [],
            notes: cycle.notes || undefined,
          }));
          
          setPeriods(supabasePeriods);
          
          // Sync to local storage for offline access
          if (useEncryption) {
            await secureStorage.setSecureData(PERIODS_STORAGE_KEY, supabasePeriods, true);
          } else {
            await AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(supabasePeriods));
          }
          
          return;
        } catch (supabaseError) {
          console.error('Error loading from Supabase:', supabaseError);
          // Fall back to local storage
        }
      }
      
      // Load from local storage (offline or fallback)
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
      // Save to local storage first
      if (useEncryption) {
        await secureStorage.setSecureData(PERIODS_STORAGE_KEY, newPeriods, true);
      } else {
        await AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(newPeriods));
      }
      
      // Sync to Supabase if authenticated
      if (isAuthenticated && user) {
        try {
          // Note: This is a simplified sync. In a real app, you'd want more sophisticated sync logic
          // to handle conflicts, deletions, etc.
          for (const period of newPeriods) {
            const cycleData = {
              user_id: user.id,
              start_date: period.startDate,
              end_date: period.endDate || null,
              notes: period.notes || null,
              is_complete: !!period.endDate,
            };
            
            // Check if cycle exists, update or insert
            const existingCycles = await SupabaseService.select('cycles', {
              eq: { column: 'id', value: period.id }
            });
            
            if (existingCycles.length > 0) {
              await SupabaseService.update('cycles', period.id, cycleData);
            } else {
              await SupabaseService.insert('cycles', {
                id: period.id,
                ...cycleData
              });
            }
          }
        } catch (supabaseError) {
          console.error('Error syncing to Supabase:', supabaseError);
          // Continue with local storage, sync will be attempted later
        }
      }
    } catch (error) {
      console.error('Error saving periods:', error);
    }
  };

  const addPeriod = async (periodData: Omit<Period, 'id'>) => {
    const newPeriod: Period = {
      ...periodData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    await savePeriods(updatedPeriods);
  };

  const updatePeriod = async (id: string, updates: Partial<Period>) => {
    const updatedPeriods = periods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    );
    setPeriods(updatedPeriods);
    await savePeriods(updatedPeriods);
  };

  const deletePeriod = async (id: string) => {
    const updatedPeriods = periods.filter(period => period.id !== id);
    setPeriods(updatedPeriods);
    await savePeriods(updatedPeriods);
    
    // Delete from Supabase
    if (isAuthenticated && user) {
      try {
        await SupabaseService.delete('cycles', id);
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
      }
    }
    
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