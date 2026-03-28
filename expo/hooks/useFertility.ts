import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

import { BBTEntry, CervicalMucusEntry, FertilityContextType, FertilityInsight } from '@/types/fertility';

const BBT_STORAGE_KEY = 'cyclesync_bbt_entries';
const CERVICAL_MUCUS_STORAGE_KEY = 'cyclesync_cervical_mucus_entries';

export const [FertilityProvider, useFertility] = createContextHook((): FertilityContextType => {
  const [bbtEntries, setBbtEntries] = useState<BBTEntry[]>([]);
  const [cervicalMucusEntries, setCervicalMucusEntries] = useState<CervicalMucusEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bbtData, mucusData] = await Promise.all([
        AsyncStorage.getItem(BBT_STORAGE_KEY),
        AsyncStorage.getItem(CERVICAL_MUCUS_STORAGE_KEY),
      ]);

      if (bbtData) {
        setBbtEntries(JSON.parse(bbtData));
      }
      if (mucusData) {
        setCervicalMucusEntries(JSON.parse(mucusData));
      }
    } catch (error) {
      console.error('Error loading fertility data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBBTEntries = async (entries: BBTEntry[]) => {
    try {
      await AsyncStorage.setItem(BBT_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving BBT entries:', error);
    }
  };

  const saveCervicalMucusEntries = async (entries: CervicalMucusEntry[]) => {
    try {
      await AsyncStorage.setItem(CERVICAL_MUCUS_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving cervical mucus entries:', error);
    }
  };

  const addBBTEntry = (entry: Omit<BBTEntry, 'id'>) => {
    const newEntry: BBTEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    const updatedEntries = [...bbtEntries, newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setBbtEntries(updatedEntries);
    saveBBTEntries(updatedEntries);
  };

  const updateBBTEntry = (id: string, updates: Partial<BBTEntry>) => {
    const updatedEntries = bbtEntries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setBbtEntries(updatedEntries);
    saveBBTEntries(updatedEntries);
  };

  const deleteBBTEntry = (id: string) => {
    const updatedEntries = bbtEntries.filter(entry => entry.id !== id);
    setBbtEntries(updatedEntries);
    saveBBTEntries(updatedEntries);
  };

  const addCervicalMucusEntry = (entry: Omit<CervicalMucusEntry, 'id'>) => {
    const newEntry: CervicalMucusEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    const updatedEntries = [...cervicalMucusEntries, newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setCervicalMucusEntries(updatedEntries);
    saveCervicalMucusEntries(updatedEntries);
  };

  const updateCervicalMucusEntry = (id: string, updates: Partial<CervicalMucusEntry>) => {
    const updatedEntries = cervicalMucusEntries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setCervicalMucusEntries(updatedEntries);
    saveCervicalMucusEntries(updatedEntries);
  };

  const deleteCervicalMucusEntry = (id: string) => {
    const updatedEntries = cervicalMucusEntries.filter(entry => entry.id !== id);
    setCervicalMucusEntries(updatedEntries);
    saveCervicalMucusEntries(updatedEntries);
  };

  return {
    bbtEntries,
    cervicalMucusEntries,
    addBBTEntry,
    updateBBTEntry,
    deleteBBTEntry,
    addCervicalMucusEntry,
    updateCervicalMucusEntry,
    deleteCervicalMucusEntry,
    isLoading,
  };
});

// Helper hook for fertility insights
export const useFertilityInsights = () => {
  const { bbtEntries, cervicalMucusEntries } = useFertility();

  const calculateBBTTrend = (entries: BBTEntry[], days: number = 3): 'rising' | 'falling' | 'stable' => {
    if (entries.length < days) return 'stable';

    const recentEntries = entries.slice(-days);
    const temperatures = recentEntries.map(entry => entry.temperature);
    
    const avgFirst = temperatures.slice(0, Math.floor(days / 2)).reduce((a, b) => a + b, 0) / Math.floor(days / 2);
    const avgLast = temperatures.slice(-Math.floor(days / 2)).reduce((a, b) => a + b, 0) / Math.floor(days / 2);
    
    const diff = avgLast - avgFirst;
    
    if (diff > 0.1) return 'rising';
    if (diff < -0.1) return 'falling';
    return 'stable';
  };

  const getFertilityScore = (date: string): number => {
    const dateObj = new Date(date);
    const bbtEntry = bbtEntries.find(entry => entry.date === date);
    const mucusEntry = cervicalMucusEntries.find(entry => entry.date === date);

    let score = 0;

    // BBT scoring
    if (bbtEntry) {
      const trend = calculateBBTTrend(bbtEntries.filter(entry => 
        new Date(entry.date) <= dateObj
      ));
      
      if (trend === 'rising') score += 30;
      else if (trend === 'stable') score += 10;
    }

    // Cervical mucus scoring
    if (mucusEntry) {
      switch (mucusEntry.consistency) {
        case 'egg-white':
          score += 40;
          break;
        case 'watery':
          score += 30;
          break;
        case 'creamy':
          score += 20;
          break;
        case 'sticky':
          score += 10;
          break;
        case 'dry':
          score += 0;
          break;
      }

      switch (mucusEntry.amount) {
        case 'heavy':
          score += 20;
          break;
        case 'moderate':
          score += 15;
          break;
        case 'light':
          score += 10;
          break;
        case 'none':
          score += 0;
          break;
      }
    }

    return Math.min(score, 100);
  };

  return {
    calculateBBTTrend,
    getFertilityScore,
  };
};