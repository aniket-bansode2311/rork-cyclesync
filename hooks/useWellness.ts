import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { WaterIntake, Activity, DailySummary, WellnessSettings } from '@/types/wellness';

const WATER_STORAGE_KEY = 'cyclesync_water_intake';
const ACTIVITY_STORAGE_KEY = 'cyclesync_activities';
const WELLNESS_SETTINGS_KEY = 'cyclesync_wellness_settings';

const DEFAULT_SETTINGS: WellnessSettings = {
  waterGoal: 8, // 8 glasses
  waterUnit: 'glasses',
  activityGoal: 30, // 30 minutes
  reminderEnabled: false,
  reminderInterval: 2, // 2 hours
};

export const [WellnessProvider, useWellness] = createContextHook(() => {
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<WellnessSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [waterData, activityData, settingsData] = await Promise.all([
        AsyncStorage.getItem(WATER_STORAGE_KEY),
        AsyncStorage.getItem(ACTIVITY_STORAGE_KEY),
        AsyncStorage.getItem(WELLNESS_SETTINGS_KEY),
      ]);

      if (waterData) {
        setWaterIntakes(JSON.parse(waterData));
      }
      if (activityData) {
        setActivities(JSON.parse(activityData));
      }
      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWaterIntakes = async (newWaterIntakes: WaterIntake[]) => {
    try {
      await AsyncStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(newWaterIntakes));
      setWaterIntakes(newWaterIntakes);
    } catch (error) {
      console.error('Error saving water intakes:', error);
    }
  };

  const saveActivities = async (newActivities: Activity[]) => {
    try {
      await AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const saveSettings = async (newSettings: WellnessSettings) => {
    try {
      await AsyncStorage.setItem(WELLNESS_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving wellness settings:', error);
    }
  };

  const addWaterIntake = async (waterIntake: Omit<WaterIntake, 'id' | 'createdAt'>) => {
    const newWaterIntake: WaterIntake = {
      ...waterIntake,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedWaterIntakes = [...waterIntakes, newWaterIntake];
    await saveWaterIntakes(updatedWaterIntakes);
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedActivities = [...activities, newActivity];
    await saveActivities(updatedActivities);
  };

  const deleteWaterIntake = async (id: string) => {
    const updatedWaterIntakes = waterIntakes.filter(intake => intake.id !== id);
    await saveWaterIntakes(updatedWaterIntakes);
  };

  const deleteActivity = async (id: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    await saveActivities(updatedActivities);
  };

  const updateSettings = async (newSettings: Partial<WellnessSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get data for a specific date
  const getDataForDate = (date: string) => {
    const dayWaterIntakes = waterIntakes.filter(intake => intake.date === date);
    const dayActivities = activities.filter(activity => activity.date === date);
    
    return {
      waterIntakes: dayWaterIntakes,
      activities: dayActivities,
    };
  };

  // Calculate daily summary
  const getDailySummary = (date: string): DailySummary => {
    const { waterIntakes: dayWaterIntakes, activities: dayActivities } = getDataForDate(date);
    
    const totalWater = dayWaterIntakes.reduce((sum, intake) => {
      // Convert all to milliliters for consistent calculation
      let amountInMl = intake.amount;
      if (intake.unit === 'glasses') {
        amountInMl = intake.amount * 240; // 8 oz glass = 240ml
      } else if (intake.unit === 'ounces') {
        amountInMl = intake.amount * 29.5735;
      }
      
      // Convert back to user's preferred unit
      if (settings.waterUnit === 'glasses') {
        return sum + (amountInMl / 240);
      } else if (settings.waterUnit === 'ounces') {
        return sum + (amountInMl / 29.5735);
      }
      return sum + amountInMl;
    }, 0);
    
    const totalActivityDuration = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);
    
    return {
      date,
      totalWater: Math.round(totalWater * 100) / 100, // Round to 2 decimal places
      waterUnit: settings.waterUnit,
      totalActivities: dayActivities.length,
      totalActivityDuration,
      activities: dayActivities,
      waterIntakes: dayWaterIntakes,
    };
  };

  // Get today's summary
  const todaySummary = useMemo(() => {
    return getDailySummary(getTodayString());
  }, [waterIntakes, activities, settings]);

  // Get progress towards goals
  const getProgress = () => {
    const waterProgress = (todaySummary.totalWater / settings.waterGoal) * 100;
    const activityProgress = (todaySummary.totalActivityDuration / settings.activityGoal) * 100;
    
    return {
      water: Math.min(waterProgress, 100),
      activity: Math.min(activityProgress, 100),
    };
  };

  // Get weekly summary
  const getWeeklySummary = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      weekData.push(getDailySummary(dateString));
    }
    
    return weekData;
  };

  return {
    // Data
    waterIntakes,
    activities,
    settings,
    isLoading,
    
    // Actions
    addWaterIntake,
    addActivity,
    deleteWaterIntake,
    deleteActivity,
    updateSettings,
    
    // Computed values
    todaySummary,
    getProgress,
    getDailySummary,
    getWeeklySummary,
    getDataForDate,
  };
});