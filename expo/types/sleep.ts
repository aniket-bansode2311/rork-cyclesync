export interface SleepEntry {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  totalEntries: number;
  bestSleep: SleepEntry | null;
  worstSleep: SleepEntry | null;
}

export interface SleepTrend {
  date: string;
  duration: number;
  quality: number;
}

export const SLEEP_QUALITY_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent'
} as const;

export type SleepQuality = keyof typeof SLEEP_QUALITY_LABELS;