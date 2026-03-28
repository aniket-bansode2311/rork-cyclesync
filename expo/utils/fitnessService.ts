import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitnessData, FitnessPermissions, FitnessSettings, DEFAULT_FITNESS_GOALS } from '@/types/fitness';

// Mock HealthKit and Google Fit APIs for web compatibility
const mockHealthKitAPI = {
  requestPermission: async (): Promise<boolean> => {
    console.log('Mock HealthKit: Requesting permissions');
    return true;
  },
  getSteps: async (date: string): Promise<number> => {
    console.log('Mock HealthKit: Getting steps for', date);
    return Math.floor(Math.random() * 15000) + 5000;
  },
  getDistance: async (date: string): Promise<number> => {
    console.log('Mock HealthKit: Getting distance for', date);
    return Math.floor(Math.random() * 10000) + 3000;
  },
  getActiveMinutes: async (date: string): Promise<number> => {
    console.log('Mock HealthKit: Getting active minutes for', date);
    return Math.floor(Math.random() * 60) + 20;
  }
};

const mockGoogleFitAPI = {
  requestPermission: async (): Promise<boolean> => {
    console.log('Mock Google Fit: Requesting permissions');
    return true;
  },
  getSteps: async (date: string): Promise<number> => {
    console.log('Mock Google Fit: Getting steps for', date);
    return Math.floor(Math.random() * 12000) + 4000;
  },
  getDistance: async (date: string): Promise<number> => {
    console.log('Mock Google Fit: Getting distance for', date);
    return Math.floor(Math.random() * 8000) + 2500;
  },
  getActiveMinutes: async (date: string): Promise<number> => {
    console.log('Mock Google Fit: Getting active minutes for', date);
    return Math.floor(Math.random() * 45) + 15;
  }
};

class FitnessService {
  private static instance: FitnessService;
  private permissions: FitnessPermissions = {
    healthkit: false,
    googlefit: false
  };
  private settings: FitnessSettings = {
    autoSync: true,
    syncInterval: 60,
    stepsGoal: DEFAULT_FITNESS_GOALS.steps,
    distanceGoal: DEFAULT_FITNESS_GOALS.distance,
    activeMinutesGoal: DEFAULT_FITNESS_GOALS.activeMinutes,
    enableNotifications: true,
    preferredSource: Platform.OS === 'ios' ? 'healthkit' : 'googlefit'
  };

  static getInstance(): FitnessService {
    if (!FitnessService.instance) {
      FitnessService.instance = new FitnessService();
    }
    return FitnessService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadPermissions();
      await this.loadSettings();
      console.log('FitnessService initialized');
    } catch (error) {
      console.error('Error initializing FitnessService:', error);
    }
  }

  async requestHealthKitPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('HealthKit not available on web, using mock');
        const granted = await mockHealthKitAPI.requestPermission();
        this.permissions.healthkit = granted;
        if (granted) {
          this.permissions.grantedAt = new Date().toISOString();
        }
        await this.savePermissions();
        return granted;
      }

      // For iOS, we would use expo-health or react-native-health
      // For now, using mock implementation
      const granted = await mockHealthKitAPI.requestPermission();
      this.permissions.healthkit = granted;
      if (granted) {
        this.permissions.grantedAt = new Date().toISOString();
      }
      await this.savePermissions();
      return granted;
    } catch (error) {
      console.error('Error requesting HealthKit permission:', error);
      return false;
    }
  }

  async requestGoogleFitPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Google Fit not available on web, using mock');
        const granted = await mockGoogleFitAPI.requestPermission();
        this.permissions.googlefit = granted;
        if (granted) {
          this.permissions.grantedAt = new Date().toISOString();
        }
        await this.savePermissions();
        return granted;
      }

      // For Android, we would use react-native-google-fit
      // For now, using mock implementation
      const granted = await mockGoogleFitAPI.requestPermission();
      this.permissions.googlefit = granted;
      if (granted) {
        this.permissions.grantedAt = new Date().toISOString();
      }
      await this.savePermissions();
      return granted;
    } catch (error) {
      console.error('Error requesting Google Fit permission:', error);
      return false;
    }
  }

  async syncFitnessData(date: string): Promise<FitnessData | null> {
    try {
      const source = this.getPreferredSource();
      
      if (!this.hasPermission(source)) {
        console.log(`No permission for ${source}, skipping sync`);
        return null;
      }

      let steps = 0;
      let distance = 0;
      let activeMinutes = 0;

      if (source === 'healthkit' && (Platform.OS === 'ios' || Platform.OS === 'web')) {
        steps = await mockHealthKitAPI.getSteps(date);
        distance = await mockHealthKitAPI.getDistance(date);
        activeMinutes = await mockHealthKitAPI.getActiveMinutes(date);
      } else if (source === 'googlefit' && (Platform.OS === 'android' || Platform.OS === 'web')) {
        steps = await mockGoogleFitAPI.getSteps(date);
        distance = await mockGoogleFitAPI.getDistance(date);
        activeMinutes = await mockGoogleFitAPI.getActiveMinutes(date);
      }

      const fitnessData: FitnessData = {
        id: `${date}-${source}`,
        date,
        steps,
        distance,
        activeMinutes,
        source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.saveFitnessData(fitnessData);
      console.log(`Synced fitness data for ${date}:`, fitnessData);
      return fitnessData;
    } catch (error) {
      console.error('Error syncing fitness data:', error);
      return null;
    }
  }

  async getFitnessData(date: string): Promise<FitnessData | null> {
    try {
      const key = `fitness_data_${date}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting fitness data:', error);
      return null;
    }
  }

  async saveFitnessData(data: FitnessData): Promise<void> {
    try {
      const key = `fitness_data_${data.date}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving fitness data:', error);
    }
  }

  async getWeeklyFitnessData(startDate: string, endDate: string): Promise<FitnessData[]> {
    try {
      const data: FitnessData[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = await this.getFitnessData(dateStr);
        if (dayData) {
          data.push(dayData);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error getting weekly fitness data:', error);
      return [];
    }
  }

  getPermissions(): FitnessPermissions {
    return { ...this.permissions };
  }

  getSettings(): FitnessSettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<FitnessSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  private getPreferredSource(): 'healthkit' | 'googlefit' {
    if (this.settings.preferredSource === 'manual') {
      return Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
    }
    return this.settings.preferredSource;
  }

  private hasPermission(source: 'healthkit' | 'googlefit'): boolean {
    return this.permissions[source];
  }

  private async loadPermissions(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('fitness_permissions');
      if (data) {
        this.permissions = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }

  private async savePermissions(): Promise<void> {
    try {
      await AsyncStorage.setItem('fitness_permissions', JSON.stringify(this.permissions));
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('fitness_settings');
      if (data) {
        this.settings = { ...this.settings, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('fitness_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}

export default FitnessService.getInstance();