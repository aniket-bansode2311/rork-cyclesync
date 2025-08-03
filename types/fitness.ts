export interface FitnessData {
  id: string;
  date: string;
  steps: number;
  distance: number; // in meters
  calories?: number;
  activeMinutes?: number;
  source: 'healthkit' | 'googlefit' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface FitnessPermissions {
  healthkit: boolean;
  googlefit: boolean;
  requestedAt?: string;
  grantedAt?: string;
}

export interface FitnessSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  stepsGoal: number;
  distanceGoal: number; // in meters
  activeMinutesGoal: number;
  enableNotifications: boolean;
  preferredSource: 'healthkit' | 'googlefit' | 'manual';
}

export interface DailyFitnessGoals {
  steps: number;
  distance: number; // in meters
  activeMinutes: number;
  calories?: number;
}

export interface FitnessProgress {
  steps: {
    current: number;
    goal: number;
    percentage: number;
  };
  distance: {
    current: number;
    goal: number;
    percentage: number;
  };
  activeMinutes: {
    current: number;
    goal: number;
    percentage: number;
  };
}

export interface WeeklyFitnessSummary {
  totalSteps: number;
  totalDistance: number;
  totalActiveMinutes: number;
  averageSteps: number;
  averageDistance: number;
  averageActiveMinutes: number;
  daysActive: number;
  goalAchievements: {
    steps: number;
    distance: number;
    activeMinutes: number;
  };
}

export const FITNESS_SOURCES = {
  healthkit: 'Apple HealthKit',
  googlefit: 'Google Fit',
  manual: 'Manual Entry'
} as const;

export const DEFAULT_FITNESS_GOALS: DailyFitnessGoals = {
  steps: 10000,
  distance: 8000, // 8km in meters
  activeMinutes: 30,
  calories: 2000
};

export const SYNC_INTERVALS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' }
] as const;