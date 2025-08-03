import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { 
  FoodEntry, 
  FoodItem, 
  MealType, 
  NutritionSummary, 
  NutritionGoals, 
  NutritionState 
} from '@/types/nutrition';
import { useAuth } from './useAuth';

const NUTRITION_STORAGE_KEY = 'nutrition_data';
const NUTRITION_GOALS_STORAGE_KEY = 'nutrition_goals';

const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
  sodium: 2300,
};

export const [NutritionProvider, useNutrition] = createContextHook(() => {
  const { user } = useAuth();
  const [state, setState] = useState<NutritionState>({
    entries: [],
    dailySummaries: {},
    goals: defaultGoals,
    isLoading: true,
    error: null,
  });

  // Load data from storage on mount
  useEffect(() => {
    loadNutritionData();
  }, [user]);

  const loadNutritionData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [entriesData, goalsData] = await Promise.all([
        AsyncStorage.getItem(NUTRITION_STORAGE_KEY),
        AsyncStorage.getItem(NUTRITION_GOALS_STORAGE_KEY),
      ]);

      const entries: FoodEntry[] = entriesData ? JSON.parse(entriesData) : [];
      const goals: NutritionGoals = goalsData ? JSON.parse(goalsData) : defaultGoals;

      // Filter entries for current user
      const userEntries = user ? entries.filter(entry => entry.userId === user.id) : [];
      
      setState(prev => ({
        ...prev,
        entries: userEntries,
        goals,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load nutrition data',
        isLoading: false,
      }));
    }
  };

  const saveNutritionData = async (entries: FoodEntry[]) => {
    try {
      await AsyncStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving nutrition data:', error);
      throw new Error('Failed to save nutrition data');
    }
  };

  const saveNutritionGoals = async (goals: NutritionGoals) => {
    try {
      await AsyncStorage.setItem(NUTRITION_GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      throw new Error('Failed to save nutrition goals');
    }
  };

  const addFoodEntry = async (
    foodItem: FoodItem,
    quantity: number,
    servings: number,
    mealType: MealType,
    date: string
  ) => {
    if (!user) {
      throw new Error('User must be logged in to add food entries');
    }

    try {
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        foodItem,
        quantity,
        servings,
        mealType,
        date,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      const updatedEntries = [...state.entries, newEntry];
      await saveNutritionData(updatedEntries);
      
      setState(prev => ({
        ...prev,
        entries: updatedEntries,
        error: null,
      }));

      return newEntry;
    } catch (error) {
      console.error('Error adding food entry:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to add food entry',
      }));
      throw error;
    }
  };

  const updateFoodEntry = async (entryId: string, updates: Partial<FoodEntry>) => {
    try {
      const updatedEntries = state.entries.map(entry =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
      
      await saveNutritionData(updatedEntries);
      
      setState(prev => ({
        ...prev,
        entries: updatedEntries,
        error: null,
      }));
    } catch (error) {
      console.error('Error updating food entry:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update food entry',
      }));
      throw error;
    }
  };

  const deleteFoodEntry = async (entryId: string) => {
    try {
      const updatedEntries = state.entries.filter(entry => entry.id !== entryId);
      await saveNutritionData(updatedEntries);
      
      setState(prev => ({
        ...prev,
        entries: updatedEntries,
        error: null,
      }));
    } catch (error) {
      console.error('Error deleting food entry:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete food entry',
      }));
      throw error;
    }
  };

  const updateNutritionGoals = async (goals: NutritionGoals) => {
    try {
      await saveNutritionGoals(goals);
      setState(prev => ({
        ...prev,
        goals,
        error: null,
      }));
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update nutrition goals',
      }));
      throw error;
    }
  };

  // Calculate daily nutrition summary
  const getDailySummary = (date: string): NutritionSummary => {
    const dayEntries = state.entries.filter(entry => entry.date === date);
    
    const mealBreakdown = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] as FoodEntry[] },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] as FoodEntry[] },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] as FoodEntry[] },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] as FoodEntry[] },
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    dayEntries.forEach(entry => {
      const multiplier = entry.servings;
      const calories = entry.foodItem.calories * multiplier;
      const protein = entry.foodItem.protein * multiplier;
      const carbs = entry.foodItem.carbs * multiplier;
      const fat = entry.foodItem.fat * multiplier;
      const fiber = (entry.foodItem.fiber || 0) * multiplier;
      const sugar = (entry.foodItem.sugar || 0) * multiplier;
      const sodium = (entry.foodItem.sodium || 0) * multiplier;

      // Add to totals
      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;
      totalFiber += fiber;
      totalSugar += sugar;
      totalSodium += sodium;

      // Add to meal breakdown
      mealBreakdown[entry.mealType].calories += calories;
      mealBreakdown[entry.mealType].protein += protein;
      mealBreakdown[entry.mealType].carbs += carbs;
      mealBreakdown[entry.mealType].fat += fat;
      mealBreakdown[entry.mealType].entries.push(entry);
    });

    return {
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSugar,
      totalSodium,
      mealBreakdown,
    };
  };

  // Get entries for a specific date
  const getEntriesForDate = (date: string): FoodEntry[] => {
    return state.entries.filter(entry => entry.date === date);
  };

  // Get entries for a specific meal
  const getEntriesForMeal = (date: string, mealType: MealType): FoodEntry[] => {
    return state.entries.filter(entry => entry.date === date && entry.mealType === mealType);
  };

  // Calculate nutrition progress for a date
  const getNutritionProgress = (date: string) => {
    const summary = getDailySummary(date);
    const goals = state.goals;

    return {
      calories: {
        current: summary.totalCalories,
        goal: goals.calories,
        percentage: Math.min((summary.totalCalories / goals.calories) * 100, 100),
      },
      protein: {
        current: summary.totalProtein,
        goal: goals.protein,
        percentage: Math.min((summary.totalProtein / goals.protein) * 100, 100),
      },
      carbs: {
        current: summary.totalCarbs,
        goal: goals.carbs,
        percentage: Math.min((summary.totalCarbs / goals.carbs) * 100, 100),
      },
      fat: {
        current: summary.totalFat,
        goal: goals.fat,
        percentage: Math.min((summary.totalFat / goals.fat) * 100, 100),
      },
      fiber: {
        current: summary.totalFiber,
        goal: goals.fiber,
        percentage: Math.min((summary.totalFiber / goals.fiber) * 100, 100),
      },
      sodium: {
        current: summary.totalSodium,
        goal: goals.sodium,
        percentage: Math.min((summary.totalSodium / goals.sodium) * 100, 100),
      },
    };
  };

  return {
    ...state,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    updateNutritionGoals,
    getDailySummary,
    getEntriesForDate,
    getEntriesForMeal,
    getNutritionProgress,
    refreshData: loadNutritionData,
  };
});