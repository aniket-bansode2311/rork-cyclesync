import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { PrivacySettings, PrivacyContextType, DEFAULT_PRIVACY_SETTINGS, UserData, DataCollectionSettings, ConsentPurposes } from '@/types/privacy';
import { secureStorage } from '@/utils/secureStorage';

const PRIVACY_SETTINGS_KEY = 'privacy_settings';

// Generate a random user ID
const generateUserId = (): string => {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const [PrivacyProvider, usePrivacy] = createContextHook((): PrivacyContextType => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load privacy settings on mount
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setIsLoading(true);
      const storedSettings = await secureStorage.getSecureData<PrivacySettings>(PRIVACY_SETTINGS_KEY, true);
      
      if (storedSettings) {
        setPrivacySettings(storedSettings);
      } else {
        // First time setup - generate user ID
        const initialSettings: PrivacySettings = {
          ...DEFAULT_PRIVACY_SETTINGS,
          userId: generateUserId(),
        };
        setPrivacySettings(initialSettings);
        await secureStorage.setSecureData(PRIVACY_SETTINGS_KEY, initialSettings, true);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      // Fallback to default settings
      const fallbackSettings: PrivacySettings = {
        ...DEFAULT_PRIVACY_SETTINGS,
        userId: generateUserId(),
      };
      setPrivacySettings(fallbackSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    try {
      const newSettings: PrivacySettings = { 
        ...privacySettings, 
        ...updates,
        lastUpdated: new Date(),
      };
      
      // If switching to anonymous mode, generate new user ID
      if (updates.anonymousMode && !privacySettings.anonymousMode) {
        newSettings.userId = generateUserId();
      }
      
      setPrivacySettings(newSettings);
      await secureStorage.setSecureData(PRIVACY_SETTINGS_KEY, newSettings, true);
      
      console.log('Privacy settings updated:', newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  };

  const updateDataCollectionSettings = async (updates: Partial<DataCollectionSettings>) => {
    try {
      const newDataCollection = { ...privacySettings.dataCollection, ...updates };
      await updatePrivacySettings({ dataCollection: newDataCollection });
    } catch (error) {
      console.error('Error updating data collection settings:', error);
      throw error;
    }
  };

  const updateConsentPurposes = async (updates: Partial<ConsentPurposes>) => {
    try {
      const newConsentPurposes = { ...privacySettings.consentPurposes, ...updates };
      await updatePrivacySettings({ consentPurposes: newConsentPurposes });
    } catch (error) {
      console.error('Error updating consent purposes:', error);
      throw error;
    }
  };

  const exportUserData = async (): Promise<string> => {
    try {
      // Collect all user data from various storage keys
      const userData: UserData = {
        periods: [],
        symptoms: [],
        fertility: [],
        pregnancy: [],
        menopause: [],
        birthControl: [],
        wellness: [],
        settings: privacySettings,
      };

      // Get data from AsyncStorage (non-secure data)
      const asyncStorageKeys = [
        'periods_data',
        'symptoms_data',
        'fertility_data',
        'pregnancy_data',
        'menopause_data',
        'birth_control_data',
        'wellness_data',
      ];

      for (const key of asyncStorageKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            switch (key) {
              case 'periods_data':
                userData.periods = parsedData;
                break;
              case 'symptoms_data':
                userData.symptoms = parsedData;
                break;
              case 'fertility_data':
                userData.fertility = parsedData;
                break;
              case 'pregnancy_data':
                userData.pregnancy = parsedData;
                break;
              case 'menopause_data':
                userData.menopause = parsedData;
                break;
              case 'birth_control_data':
                userData.birthControl = parsedData;
                break;
              case 'wellness_data':
                userData.wellness = parsedData;
                break;
            }
          }
        } catch (error) {
          console.error(`Error loading ${key}:`, error);
        }
      }

      // Get secure data
      try {
        const secureKeys = await secureStorage.getAllKeys();
        for (const key of secureKeys) {
          if (key !== PRIVACY_SETTINGS_KEY) {
            const secureData = await secureStorage.getSecureData(key, privacySettings.dataEncryption);
            if (secureData) {
              (userData as any)[key] = secureData;
            }
          }
        }
      } catch (error) {
        console.error('Error loading secure data:', error);
      }

      // Create export data with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        userId: privacySettings.anonymousMode ? 'anonymous' : privacySettings.userId,
        data: userData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  };

  const deleteAllUserData = async () => {
    try {
      // Clear AsyncStorage data
      const asyncStorageKeys = [
        'periods_data',
        'symptoms_data',
        'fertility_data',
        'pregnancy_data',
        'menopause_data',
        'birth_control_data',
        'wellness_data',
      ];

      for (const key of asyncStorageKeys) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.error(`Error removing ${key}:`, error);
        }
      }

      // Clear all secure storage
      await secureStorage.clearAllSecureData();

      // Reset privacy settings to default with new user ID
      const newSettings: PrivacySettings = {
        ...DEFAULT_PRIVACY_SETTINGS,
        userId: generateUserId(),
      };
      
      setPrivacySettings(newSettings);
      await secureStorage.setSecureData(PRIVACY_SETTINGS_KEY, newSettings, true);

      console.log('All user data deleted successfully');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  };

  return {
    privacySettings,
    updatePrivacySettings,
    updateDataCollectionSettings,
    updateConsentPurposes,
    exportUserData,
    deleteAllUserData,
    isLoading,
  };
});