export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ConversationContext {
  currentCycleDay?: number;
  nextPeriodDate?: Date;
  lastPeriodDate?: Date;
  recentSymptoms?: string[];
  cycleLength?: number;
}

export interface HealthCoachResponse {
  message: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface QuickQuestion {
  id: string;
  text: string;
  category: 'period' | 'symptoms' | 'nutrition' | 'general';
}

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: '1', text: 'When is my next period?', category: 'period' },
  { id: '2', text: 'What are common PMS symptoms?', category: 'symptoms' },
  { id: '3', text: 'What should I eat to help with cramps?', category: 'nutrition' },
  { id: '4', text: 'How can I track my cycle better?', category: 'general' },
  { id: '5', text: 'What is a normal cycle length?', category: 'period' },
  { id: '6', text: 'How can I manage mood swings?', category: 'symptoms' },
];