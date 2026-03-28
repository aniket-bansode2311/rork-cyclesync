import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { secureStorage } from '@/utils/secureStorage';
import { PrivacySettings } from '@/types/privacy';

import {
  CustomSymptom,
  LoggedMood,
  LoggedSymptom,
  SymptomContextType,
} from '@/types/symptoms';

const SYMPTOMS_STORAGE_KEY = 'cyclesync_symptoms';
const MOODS_STORAGE_KEY = 'cyclesync_moods';
const CUSTOM_SYMPTOMS_STORAGE_KEY = 'cyclesync_custom_symptoms';

export const [SymptomProvider, useSymptoms] = createContextHook<SymptomContextType>(() => {
  const [loggedSymptoms, setLoggedSymptoms] = useState<LoggedSymptom[]>([]);
  const [loggedMoods, setLoggedMoods] = useState<LoggedMood[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useEncryption, setUseEncryption] = useState<boolean>(true);

  // Load data from storage on mount
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
    loadData();
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Try secure storage first if encryption is enabled
      if (useEncryption) {
        const [secureSymptoms, secureMoods, secureCustomSymptoms] = await Promise.all([
          secureStorage.getSecureData<LoggedSymptom[]>(SYMPTOMS_STORAGE_KEY, true),
          secureStorage.getSecureData<LoggedMood[]>(MOODS_STORAGE_KEY, true),
          secureStorage.getSecureData<CustomSymptom[]>(CUSTOM_SYMPTOMS_STORAGE_KEY, true),
        ]);
        
        if (secureSymptoms) setLoggedSymptoms(secureSymptoms);
        if (secureMoods) setLoggedMoods(secureMoods);
        if (secureCustomSymptoms) setCustomSymptoms(secureCustomSymptoms);
        
        // If we found secure data, we're done
        if (secureSymptoms || secureMoods || secureCustomSymptoms) {
          return;
        }
      }
      
      // Fallback to AsyncStorage
      const [symptomsData, moodsData, customSymptomsData] = await Promise.all([
        AsyncStorage.getItem(SYMPTOMS_STORAGE_KEY),
        AsyncStorage.getItem(MOODS_STORAGE_KEY),
        AsyncStorage.getItem(CUSTOM_SYMPTOMS_STORAGE_KEY),
      ]);

      if (symptomsData) {
        const parsedSymptoms = JSON.parse(symptomsData);
        setLoggedSymptoms(parsedSymptoms);
        if (useEncryption) {
          await secureStorage.setSecureData(SYMPTOMS_STORAGE_KEY, parsedSymptoms, true);
          await AsyncStorage.removeItem(SYMPTOMS_STORAGE_KEY);
        }
      }
      
      if (moodsData) {
        const parsedMoods = JSON.parse(moodsData);
        setLoggedMoods(parsedMoods);
        if (useEncryption) {
          await secureStorage.setSecureData(MOODS_STORAGE_KEY, parsedMoods, true);
          await AsyncStorage.removeItem(MOODS_STORAGE_KEY);
        }
      }
      
      if (customSymptomsData) {
        const parsedCustomSymptoms = JSON.parse(customSymptomsData);
        setCustomSymptoms(parsedCustomSymptoms);
        if (useEncryption) {
          await secureStorage.setSecureData(CUSTOM_SYMPTOMS_STORAGE_KEY, parsedCustomSymptoms, true);
          await AsyncStorage.removeItem(CUSTOM_SYMPTOMS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading symptom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSymptoms = async (symptoms: LoggedSymptom[]) => {
    try {
      if (useEncryption) {
        await secureStorage.setSecureData(SYMPTOMS_STORAGE_KEY, symptoms, true);
      } else {
        await AsyncStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(symptoms));
      }
    } catch (error) {
      console.error('Error saving symptoms:', error);
    }
  };

  const saveMoods = async (moods: LoggedMood[]) => {
    try {
      if (useEncryption) {
        await secureStorage.setSecureData(MOODS_STORAGE_KEY, moods, true);
      } else {
        await AsyncStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(moods));
      }
    } catch (error) {
      console.error('Error saving moods:', error);
    }
  };

  const saveCustomSymptoms = async (symptoms: CustomSymptom[]) => {
    try {
      if (useEncryption) {
        await secureStorage.setSecureData(CUSTOM_SYMPTOMS_STORAGE_KEY, symptoms, true);
      } else {
        await AsyncStorage.setItem(CUSTOM_SYMPTOMS_STORAGE_KEY, JSON.stringify(symptoms));
      }
    } catch (error) {
      console.error('Error saving custom symptoms:', error);
    }
  };

  const addSymptom = (symptomData: Omit<LoggedSymptom, 'id'>) => {
    const newSymptom: LoggedSymptom = {
      ...symptomData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedSymptoms = [...loggedSymptoms, newSymptom];
    setLoggedSymptoms(updatedSymptoms);
    saveSymptoms(updatedSymptoms);
    
    console.log('Added symptom:', newSymptom);
  };

  const addMood = (moodData: Omit<LoggedMood, 'id'>) => {
    const newMood: LoggedMood = {
      ...moodData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedMoods = [...loggedMoods, newMood];
    setLoggedMoods(updatedMoods);
    saveMoods(updatedMoods);
    
    console.log('Added mood:', newMood);
  };

  const addCustomSymptom = (symptomData: Omit<CustomSymptom, 'id' | 'createdAt'>) => {
    const newCustomSymptom: CustomSymptom = {
      ...symptomData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    
    const updatedCustomSymptoms = [...customSymptoms, newCustomSymptom];
    setCustomSymptoms(updatedCustomSymptoms);
    saveCustomSymptoms(updatedCustomSymptoms);
    
    console.log('Added custom symptom:', newCustomSymptom);
  };

  const deleteSymptom = (id: string) => {
    const updatedSymptoms = loggedSymptoms.filter(symptom => symptom.id !== id);
    setLoggedSymptoms(updatedSymptoms);
    saveSymptoms(updatedSymptoms);
    
    console.log('Deleted symptom:', id);
  };

  const deleteMood = (id: string) => {
    const updatedMoods = loggedMoods.filter(mood => mood.id !== id);
    setLoggedMoods(updatedMoods);
    saveMoods(updatedMoods);
    
    console.log('Deleted mood:', id);
  };

  const getSymptomsByDate = (date: string): LoggedSymptom[] => {
    return loggedSymptoms.filter(symptom => 
      symptom.date.split('T')[0] === date.split('T')[0]
    );
  };

  const getMoodsByDate = (date: string): LoggedMood[] => {
    return loggedMoods.filter(mood => 
      mood.date.split('T')[0] === date.split('T')[0]
    );
  };

  return {
    loggedSymptoms,
    loggedMoods,
    customSymptoms,
    addSymptom,
    addMood,
    addCustomSymptom,
    deleteSymptom,
    deleteMood,
    getSymptomsByDate,
    getMoodsByDate,
    isLoading,
  };
});