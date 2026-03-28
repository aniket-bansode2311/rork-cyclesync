export interface MenopauseSymptom {
  id: string;
  date: string;
  symptom: string;
  intensity: 'mild' | 'moderate' | 'severe';
  frequency: 'rarely' | 'sometimes' | 'often' | 'daily';
  notes?: string;
  createdAt: string;
}

export interface IrregularPeriod {
  id: string;
  date: string;
  type: 'normal' | 'light' | 'heavy' | 'spotting' | 'skipped';
  duration?: number; // days
  notes?: string;
  createdAt: string;
}

export interface MenopauseMode {
  isActive: boolean;
  stage: 'perimenopause' | 'menopause' | 'postmenopause';
  activatedAt: string;
  lastPeriodDate?: string;
}

export interface MenopauseStats {
  totalSymptoms: number;
  mostCommonSymptom?: string;
  averageIntensity: number;
  daysSinceLastPeriod?: number;
  irregularPeriodsCount: number;
}

export const MENOPAUSE_SYMPTOMS = [
  'Hot Flashes',
  'Night Sweats',
  'Mood Swings',
  'Sleep Disturbances',
  'Vaginal Dryness',
  'Joint Pain',
  'Brain Fog',
  'Fatigue',
  'Weight Gain',
  'Hair Thinning',
  'Dry Skin',
  'Decreased Libido',
  'Headaches',
  'Anxiety',
  'Depression',
  'Irritability',
  'Memory Issues',
  'Bloating',
  'Breast Tenderness',
  'Irregular Heartbeat'
] as const;

export type MenopauseSymptomType = typeof MENOPAUSE_SYMPTOMS[number];

export const PERIOD_TYPES = [
  { value: 'normal', label: 'Normal Flow', color: '#FF6B6B' },
  { value: 'light', label: 'Light Flow', color: '#FFB3B3' },
  { value: 'heavy', label: 'Heavy Flow', color: '#CC0000' },
  { value: 'spotting', label: 'Spotting', color: '#FF9999' },
  { value: 'skipped', label: 'Skipped Period', color: '#999999' }
] as const;

export const EDUCATIONAL_CONTENT = {
  perimenopause: {
    title: 'Understanding Perimenopause',
    content: 'Perimenopause is the transitional period before menopause when hormone levels begin to fluctuate. This phase can last several years and is characterized by irregular periods and various symptoms.'
  },
  menopause: {
    title: 'Navigating Menopause',
    content: 'Menopause is officially diagnosed after 12 consecutive months without a menstrual period. Understanding the changes in your body can help you manage symptoms effectively.'
  },
  postmenopause: {
    title: 'Life After Menopause',
    content: 'Postmenopause begins after menopause is complete. While some symptoms may continue, many women find this phase liberating and empowering.'
  },
  tips: [
    'Stay hydrated and maintain a balanced diet',
    'Regular exercise can help manage symptoms',
    'Practice stress-reduction techniques',
    'Consider hormone therapy if appropriate',
    'Maintain regular check-ups with your healthcare provider',
    'Connect with support groups or communities',
    'Keep a symptom diary to track patterns',
    'Prioritize sleep hygiene'
  ]
};