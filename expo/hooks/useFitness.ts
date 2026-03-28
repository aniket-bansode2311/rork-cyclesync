import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { FitnessData, FitnessPermissions, FitnessSettings, FitnessProgress, WeeklyFitnessSummary } from '@/types/fitness';
import FitnessService from '@/utils/fitnessService';

export function useFitness() {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [weeklyData, setWeeklyData] = useState<FitnessData[]>([]);
  const [permissions, setPermissions] = useState<FitnessPermissions>({
    healthkit: false,
    googlefit: false
  });
  const [settings, setSettings] = useState<FitnessSettings>({
    autoSync: true,
    syncInterval: 60,
    stepsGoal: 10000,
    distanceGoal: 8000,
    activeMinutesGoal: 30,
    enableNotifications: true,
    preferredSource: Platform.OS === 'ios' ? 'healthkit' : 'googlefit'
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    initializeFitness();
  }, []);

  const initializeFitness = async () => {
    try {
      setIsLoading(true);
      await FitnessService.initialize();
      
      const currentPermissions = FitnessService.getPermissions();
      const currentSettings = FitnessService.getSettings();
      
      setPermissions(currentPermissions);
      setSettings(currentSettings);
      
      // Load today's data
      const today = new Date().toISOString().split('T')[0];
      const todayData = await FitnessService.getFitnessData(today);
      setFitnessData(todayData);
      
      // Load weekly data
      await loadWeeklyData();
      
      // Auto-sync if enabled and permissions granted
      if (currentSettings.autoSync && hasAnyPermission(currentPermissions)) {
        await syncTodayData();
      }
    } catch (error) {
      console.error('Error initializing fitness:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestHealthKitPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const granted = await FitnessService.requestHealthKitPermission();
      const updatedPermissions = FitnessService.getPermissions();
      setPermissions(updatedPermissions);
      
      if (granted) {
        await syncTodayData();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting HealthKit permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestGoogleFitPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const granted = await FitnessService.requestGoogleFitPermission();
      const updatedPermissions = FitnessService.getPermissions();
      setPermissions(updatedPermissions);
      
      if (granted) {
        await syncTodayData();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting Google Fit permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncTodayData = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      const today = new Date().toISOString().split('T')[0];
      const syncedData = await FitnessService.syncFitnessData(today);
      
      if (syncedData) {
        setFitnessData(syncedData);
        setLastSyncTime(new Date().toISOString());
        await loadWeeklyData(); // Refresh weekly data
      }
    } catch (error) {
      console.error('Error syncing today data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadWeeklyData = async (): Promise<void> => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6); // Last 7 days
      
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const data = await FitnessService.getWeeklyFitnessData(startDate, endDate);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<FitnessSettings>): Promise<void> => {
    try {
      await FitnessService.updateSettings(newSettings);
      const updatedSettings = FitnessService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getTodayProgress = useCallback((): FitnessProgress => {
    const current = fitnessData || {
      steps: 0,
      distance: 0,
      activeMinutes: 0
    };

    return {
      steps: {
        current: current.steps,
        goal: settings.stepsGoal,
        percentage: Math.min((current.steps / settings.stepsGoal) * 100, 100)
      },
      distance: {
        current: current.distance,
        goal: settings.distanceGoal,
        percentage: Math.min((current.distance / settings.distanceGoal) * 100, 100)
      },
      activeMinutes: {
        current: current.activeMinutes || 0,
        goal: settings.activeMinutesGoal,
        percentage: Math.min(((current.activeMinutes || 0) / settings.activeMinutesGoal) * 100, 100)
      }
    };
  }, [fitnessData, settings]);

  const getWeeklySummary = useCallback((): WeeklyFitnessSummary => {
    if (weeklyData.length === 0) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalActiveMinutes: 0,
        averageSteps: 0,
        averageDistance: 0,
        averageActiveMinutes: 0,
        daysActive: 0,
        goalAchievements: {
          steps: 0,
          distance: 0,
          activeMinutes: 0
        }
      };
    }

    const totals = weeklyData.reduce(
      (acc, day) => ({
        steps: acc.steps + day.steps,
        distance: acc.distance + day.distance,
        activeMinutes: acc.activeMinutes + (day.activeMinutes || 0)
      }),
      { steps: 0, distance: 0, activeMinutes: 0 }
    );

    const daysActive = weeklyData.filter(day => day.steps > 1000).length;
    const goalAchievements = weeklyData.reduce(
      (acc, day) => ({
        steps: acc.steps + (day.steps >= settings.stepsGoal ? 1 : 0),
        distance: acc.distance + (day.distance >= settings.distanceGoal ? 1 : 0),
        activeMinutes: acc.activeMinutes + ((day.activeMinutes || 0) >= settings.activeMinutesGoal ? 1 : 0)
      }),
      { steps: 0, distance: 0, activeMinutes: 0 }
    );

    return {
      totalSteps: totals.steps,
      totalDistance: totals.distance,
      totalActiveMinutes: totals.activeMinutes,
      averageSteps: Math.round(totals.steps / weeklyData.length),
      averageDistance: Math.round(totals.distance / weeklyData.length),
      averageActiveMinutes: Math.round(totals.activeMinutes / weeklyData.length),
      daysActive,
      goalAchievements
    };
  }, [weeklyData, settings]);

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  const formatSteps = (steps: number): string => {
    if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toString();
  };

  const hasAnyPermission = (perms: FitnessPermissions): boolean => {
    return perms.healthkit || perms.googlefit;
  };

  const canSync = (): boolean => {
    return hasAnyPermission(permissions);
  };

  const getAvailableSources = (): Array<'healthkit' | 'googlefit'> => {
    const sources: Array<'healthkit' | 'googlefit'> = [];
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      sources.push('healthkit');
    }
    if (Platform.OS === 'android' || Platform.OS === 'web') {
      sources.push('googlefit');
    }
    return sources;
  };

  return {
    // Data
    fitnessData,
    weeklyData,
    permissions,
    settings,
    
    // State
    isLoading,
    isSyncing,
    lastSyncTime,
    
    // Actions
    requestHealthKitPermission,
    requestGoogleFitPermission,
    syncTodayData,
    updateSettings,
    loadWeeklyData,
    
    // Computed
    todayProgress: getTodayProgress(),
    weeklySummary: getWeeklySummary(),
    
    // Utilities
    formatDistance,
    formatSteps,
    canSync,
    getAvailableSources,
    hasAnyPermission: () => hasAnyPermission(permissions)
  };
}