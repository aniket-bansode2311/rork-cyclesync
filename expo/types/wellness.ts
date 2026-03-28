export interface WaterIntake {
  id: string;
  date: string;
  amount: number;
  unit: 'glasses' | 'ounces' | 'milliliters';
  time: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  date: string;
  type: string;
  duration: number; // in minutes
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  time: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalWater: number;
  waterUnit: 'glasses' | 'ounces' | 'milliliters';
  totalActivities: number;
  totalActivityDuration: number;
  activities: Activity[];
  waterIntakes: WaterIntake[];
}

export interface WellnessSettings {
  waterGoal: number;
  waterUnit: 'glasses' | 'ounces' | 'milliliters';
  activityGoal: number; // in minutes
  reminderEnabled: boolean;
  reminderInterval: number; // in hours
}

export const ACTIVITY_TYPES = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Yoga',
  'Pilates',
  'Weight Training',
  'Dancing',
  'Hiking',
  'Stretching',
  'Other'
] as const;

export const WATER_UNITS = [
  { value: 'glasses', label: 'Glasses (8 oz)', conversion: 240 }, // ml per glass
  { value: 'ounces', label: 'Ounces', conversion: 29.5735 }, // ml per ounce
  { value: 'milliliters', label: 'Milliliters', conversion: 1 }
] as const;

export const QUICK_WATER_AMOUNTS = {
  glasses: [1, 2, 3, 4],
  ounces: [8, 16, 24, 32],
  milliliters: [250, 500, 750, 1000]
};