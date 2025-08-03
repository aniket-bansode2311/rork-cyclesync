import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { 
  MenopauseSymptom, 
  IrregularPeriod, 
  MenopauseMode, 
  MenopauseStats 
} from '@/types/menopause';

const MENOPAUSE_STORAGE_KEY = '@menopause_data';
const MENOPAUSE_SYMPTOMS_KEY = '@menopause_symptoms';
const IRREGULAR_PERIODS_KEY = '@irregular_periods';

export const [MenopauseProvider, useMenopause] = createContextHook(() => {
  const [menopauseMode, setMenopauseMode] = useState<MenopauseMode>({
    isActive: false,
    stage: 'perimenopause',
    activatedAt: new Date().toISOString()
  });
  const [symptoms, setSymptoms] = useState<MenopauseSymptom[]>([]);
  const [irregularPeriods, setIrregularPeriods] = useState<IrregularPeriod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [modeData, symptomsData, periodsData] = await Promise.all([
          AsyncStorage.getItem(MENOPAUSE_STORAGE_KEY),
          AsyncStorage.getItem(MENOPAUSE_SYMPTOMS_KEY),
          AsyncStorage.getItem(IRREGULAR_PERIODS_KEY)
        ]);

        if (modeData) {
          setMenopauseMode(JSON.parse(modeData));
        }
        if (symptomsData) {
          setSymptoms(JSON.parse(symptomsData));
        }
        if (periodsData) {
          setIrregularPeriods(JSON.parse(periodsData));
        }
      } catch (error) {
        console.error('Error loading menopause data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save menopause mode to AsyncStorage
  const saveMenopauseMode = async (mode: MenopauseMode) => {
    try {
      await AsyncStorage.setItem(MENOPAUSE_STORAGE_KEY, JSON.stringify(mode));
      setMenopauseMode(mode);
    } catch (error) {
      console.error('Error saving menopause mode:', error);
    }
  };

  // Save symptoms to AsyncStorage
  const saveSymptoms = async (newSymptoms: MenopauseSymptom[]) => {
    try {
      await AsyncStorage.setItem(MENOPAUSE_SYMPTOMS_KEY, JSON.stringify(newSymptoms));
      setSymptoms(newSymptoms);
    } catch (error) {
      console.error('Error saving symptoms:', error);
    }
  };

  // Save irregular periods to AsyncStorage
  const saveIrregularPeriods = async (newPeriods: IrregularPeriod[]) => {
    try {
      await AsyncStorage.setItem(IRREGULAR_PERIODS_KEY, JSON.stringify(newPeriods));
      setIrregularPeriods(newPeriods);
    } catch (error) {
      console.error('Error saving irregular periods:', error);
    }
  };

  // Activate menopause mode
  const activateMenopauseMode = async (stage: 'perimenopause' | 'menopause' | 'postmenopause', lastPeriodDate?: string) => {
    const newMode: MenopauseMode = {
      isActive: true,
      stage,
      activatedAt: new Date().toISOString(),
      lastPeriodDate
    };
    await saveMenopauseMode(newMode);
  };

  // Deactivate menopause mode
  const deactivateMenopauseMode = async () => {
    const newMode: MenopauseMode = {
      isActive: false,
      stage: 'perimenopause',
      activatedAt: new Date().toISOString()
    };
    await saveMenopauseMode(newMode);
  };

  // Add symptom
  const addSymptom = async (symptomData: Omit<MenopauseSymptom, 'id' | 'createdAt'>) => {
    const newSymptom: MenopauseSymptom = {
      ...symptomData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedSymptoms = [...symptoms, newSymptom];
    await saveSymptoms(updatedSymptoms);
  };

  // Update symptom
  const updateSymptom = async (id: string, updates: Partial<MenopauseSymptom>) => {
    const updatedSymptoms = symptoms.map(symptom =>
      symptom.id === id ? { ...symptom, ...updates } : symptom
    );
    await saveSymptoms(updatedSymptoms);
  };

  // Delete symptom
  const deleteSymptom = async (id: string) => {
    const updatedSymptoms = symptoms.filter(symptom => symptom.id !== id);
    await saveSymptoms(updatedSymptoms);
  };

  // Add irregular period
  const addIrregularPeriod = async (periodData: Omit<IrregularPeriod, 'id' | 'createdAt'>) => {
    const newPeriod: IrregularPeriod = {
      ...periodData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedPeriods = [...irregularPeriods, newPeriod];
    await saveIrregularPeriods(updatedPeriods);
  };

  // Update irregular period
  const updateIrregularPeriod = async (id: string, updates: Partial<IrregularPeriod>) => {
    const updatedPeriods = irregularPeriods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    );
    await saveIrregularPeriods(updatedPeriods);
  };

  // Delete irregular period
  const deleteIrregularPeriod = async (id: string) => {
    const updatedPeriods = irregularPeriods.filter(period => period.id !== id);
    await saveIrregularPeriods(updatedPeriods);
  };

  // Calculate menopause stats
  const menopauseStats = useMemo((): MenopauseStats => {
    const totalSymptoms = symptoms.length;
    
    // Find most common symptom
    const symptomCounts = symptoms.reduce((acc, symptom) => {
      acc[symptom.symptom] = (acc[symptom.symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonSymptom = Object.keys(symptomCounts).reduce((a, b) => 
      symptomCounts[a] > symptomCounts[b] ? a : b, ''
    );

    // Calculate average intensity
    const intensityValues = { mild: 1, moderate: 2, severe: 3 };
    const averageIntensity = symptoms.length > 0 
      ? symptoms.reduce((sum, symptom) => sum + intensityValues[symptom.intensity], 0) / symptoms.length
      : 0;

    // Calculate days since last period
    let daysSinceLastPeriod: number | undefined;
    if (menopauseMode.lastPeriodDate) {
      const lastPeriodDate = new Date(menopauseMode.lastPeriodDate);
      const today = new Date();
      daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const irregularPeriodsCount = irregularPeriods.length;

    return {
      totalSymptoms,
      mostCommonSymptom: totalSymptoms > 0 ? mostCommonSymptom : undefined,
      averageIntensity,
      daysSinceLastPeriod,
      irregularPeriodsCount
    };
  }, [symptoms, irregularPeriods, menopauseMode.lastPeriodDate]);

  // Get symptoms for a specific date
  const getSymptomsForDate = (date: string): MenopauseSymptom[] => {
    return symptoms.filter(symptom => symptom.date === date);
  };

  // Get recent symptoms (last 30 days)
  const getRecentSymptoms = (): MenopauseSymptom[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return symptoms.filter(symptom => 
      new Date(symptom.date) >= thirtyDaysAgo
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get recent irregular periods (last 6 months)
  const getRecentIrregularPeriods = (): IrregularPeriod[] => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return irregularPeriods.filter(period => 
      new Date(period.date) >= sixMonthsAgo
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    // State
    menopauseMode,
    symptoms,
    irregularPeriods,
    menopauseStats,
    isLoading,
    
    // Mode management
    activateMenopauseMode,
    deactivateMenopauseMode,
    
    // Symptom management
    addSymptom,
    updateSymptom,
    deleteSymptom,
    getSymptomsForDate,
    getRecentSymptoms,
    
    // Irregular period management
    addIrregularPeriod,
    updateIrregularPeriod,
    deleteIrregularPeriod,
    getRecentIrregularPeriods
  };
});