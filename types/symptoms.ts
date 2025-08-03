export type SymptomIntensity = 'mild' | 'moderate' | 'severe';

export type MoodType = 'happy' | 'sad' | 'anxious' | 'energetic' | 'irritable' | 'calm' | 'stressed' | 'excited';

export interface PredefinedSymptom {
  id: string;
  name: string;
  category: 'physical' | 'emotional';
  icon?: string;
}

export interface LoggedSymptom {
  id: string;
  symptomId: string;
  symptomName: string;
  intensity: SymptomIntensity;
  notes?: string;
  date: string; // ISO date string
  isCustom: boolean;
}

export interface LoggedMood {
  id: string;
  mood: MoodType;
  intensity: number; // 1-5 scale
  notes?: string;
  date: string; // ISO date string
}

export interface CustomSymptom {
  id: string;
  name: string;
  category: 'physical' | 'emotional';
  createdAt: string;
}

export interface SymptomContextType {
  loggedSymptoms: LoggedSymptom[];
  loggedMoods: LoggedMood[];
  customSymptoms: CustomSymptom[];
  addSymptom: (symptom: Omit<LoggedSymptom, 'id'>) => void;
  addMood: (mood: Omit<LoggedMood, 'id'>) => void;
  addCustomSymptom: (symptom: Omit<CustomSymptom, 'id' | 'createdAt'>) => void;
  deleteSymptom: (id: string) => void;
  deleteMood: (id: string) => void;
  getSymptomsByDate: (date: string) => LoggedSymptom[];
  getMoodsByDate: (date: string) => LoggedMood[];
  isLoading: boolean;
}

export const PREDEFINED_SYMPTOMS: PredefinedSymptom[] = [
  // Physical symptoms
  { id: 'cramps', name: 'Cramps', category: 'physical' },
  { id: 'headache', name: 'Headache', category: 'physical' },
  { id: 'fatigue', name: 'Fatigue', category: 'physical' },
  { id: 'bloating', name: 'Bloating', category: 'physical' },
  { id: 'acne', name: 'Acne', category: 'physical' },
  { id: 'breast_tenderness', name: 'Breast Tenderness', category: 'physical' },
  { id: 'back_pain', name: 'Back Pain', category: 'physical' },
  { id: 'nausea', name: 'Nausea', category: 'physical' },
  { id: 'hot_flashes', name: 'Hot Flashes', category: 'physical' },
  { id: 'food_cravings', name: 'Food Cravings', category: 'physical' },
  
  // Emotional symptoms
  { id: 'mood_swings', name: 'Mood Swings', category: 'emotional' },
  { id: 'anxiety', name: 'Anxiety', category: 'emotional' },
  { id: 'depression', name: 'Depression', category: 'emotional' },
  { id: 'irritability', name: 'Irritability', category: 'emotional' },
  { id: 'emotional_sensitivity', name: 'Emotional Sensitivity', category: 'emotional' },
  { id: 'difficulty_concentrating', name: 'Difficulty Concentrating', category: 'emotional' },
];