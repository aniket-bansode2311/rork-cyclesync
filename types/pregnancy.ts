export interface PregnancyData {
  id: string;
  isActive: boolean;
  lastMenstrualPeriod?: string;
  estimatedConceptionDate?: string;
  dueDate: string;
  currentWeek: number;
  activatedDate: string;
  notes?: string;
}

export interface PregnancyChecklist {
  id: string;
  pregnancyId: string;
  title: string;
  description: string;
  completed: boolean;
  dueWeek?: number;
  completedDate?: string;
}

export interface WeeklyUpdate {
  week: number;
  title: string;
  fetalDevelopment: string;
  maternalChanges: string;
  tips: string[];
}

export interface PostpartumData {
  id: string;
  isActive: boolean;
  deliveryDate: string;
  deliveryType: 'vaginal' | 'cesarean';
  activatedDate: string;
  notes?: string;
}

export interface PostpartumBleeding {
  id: string;
  date: string;
  intensity: 'light' | 'moderate' | 'heavy';
  color: 'bright_red' | 'dark_red' | 'brown' | 'pink';
  clots: boolean;
  notes?: string;
}

export interface PostpartumRecovery {
  id: string;
  date: string;
  category: 'physical' | 'emotional' | 'breastfeeding' | 'sleep';
  milestone: string;
  rating: number; // 1-5 scale
  notes?: string;
}

export interface PostpartumMood {
  id: string;
  date: string;
  mood: 'excellent' | 'good' | 'okay' | 'difficult' | 'very_difficult';
  anxiety: number; // 1-5 scale
  sadness: number; // 1-5 scale
  overwhelmed: number; // 1-5 scale
  bonding: number; // 1-5 scale
  notes?: string;
}