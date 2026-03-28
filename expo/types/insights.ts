export type InsightType = 'pattern' | 'prediction' | 'recommendation' | 'correlation' | 'health_tip' | 'alert' | 'achievement';

export type InsightCategory = 'period' | 'symptoms' | 'mood' | 'fertility' | 'wellness' | 'general' | 'nutrition' | 'sleep' | 'activity';

export type FeedbackType = 'helpful' | 'not_helpful' | 'very_helpful';

export type InsightPriority = 'low' | 'medium' | 'high' | 'urgent';

export type InsightSource = 'ai' | 'rule_based' | 'user_input' | 'clinical_data';

export interface AIInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  content: string;
  confidence: number; // 0-1 scale
  priority: InsightPriority;
  source: InsightSource;
  dataPoints: string[]; // References to data that generated this insight
  generatedAt: string; // ISO date string
  expiresAt?: string; // Optional expiration date for time-sensitive insights
  isRead: boolean;
  isDismissed: boolean;
  actionTaken?: boolean; // Whether user acted on the recommendation
  relatedInsights?: string[]; // IDs of related insights
  tags?: string[]; // Searchable tags
  feedback?: {
    type: FeedbackType;
    submittedAt: string;
    notes?: string;
    helpfulnessScore?: number; // 1-5 scale
  };
  metadata?: {
    cycleDay?: number;
    cyclePhase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    seasonality?: string;
    correlationStrength?: number;
  };
}

export interface InsightFeedback {
  insightId: string;
  type: FeedbackType;
  notes?: string;
  submittedAt: string;
  helpfulnessScore?: number; // 1-5 scale
  actionTaken?: boolean;
  improvementSuggestions?: string;
}

export interface UserDataSummary {
  periods: {
    averageCycleLength: number;
    lastPeriodDate?: string;
    totalPeriods: number;
    cycleVariability: number;
    predictedNextPeriod?: string;
  };
  symptoms: {
    commonSymptoms: Array<{
      name: string;
      frequency: number;
      averageIntensity: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    recentSymptoms: Array<{
      name: string;
      date: string;
      intensity: string;
      cycleDay?: number;
    }>;
    symptomPatterns: Array<{
      symptom: string;
      cyclePhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
      likelihood: number;
    }>;
  };
  moods: {
    commonMoods: Array<{
      mood: string;
      frequency: number;
      averageIntensity: number;
      trend: 'improving' | 'worsening' | 'stable';
    }>;
    recentMoods: Array<{
      mood: string;
      date: string;
      intensity: number;
      cycleDay?: number;
    }>;
    moodPatterns: Array<{
      mood: string;
      cyclePhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
      correlation: number;
    }>;
  };
  wellness?: {
    sleepQuality: number;
    activityLevel: number;
    nutritionScore: number;
    stressLevel: number;
  };
  fertility?: {
    ovulationPrediction?: string;
    fertilityWindow?: { start: string; end: string };
    bbtTrend?: 'rising' | 'falling' | 'stable';
  };
}

export interface InsightContextType {
  insights: AIInsight[];
  isLoading: boolean;
  isGenerating: boolean;
  lastSyncAt?: string;
  generateInsights: (options?: InsightGenerationOptions) => Promise<void>;
  markAsRead: (insightId: string) => void;
  submitFeedback: (feedback: InsightFeedback) => void;
  dismissInsight: (insightId: string) => void;
  refreshInsights: () => Promise<void>;
  markActionTaken: (insightId: string) => void;
  getInsightsByCategory: (category: InsightCategory) => AIInsight[];
  getInsightsByPriority: (priority: InsightPriority) => AIInsight[];
  searchInsights: (query: string) => AIInsight[];
  getInsightAnalytics: () => InsightAnalytics;
}

export interface InsightGenerationOptions {
  categories?: InsightCategory[];
  forceRefresh?: boolean;
  includeExpired?: boolean;
  maxInsights?: number;
}

export interface InsightAnalytics {
  totalInsights: number;
  readInsights: number;
  actionTakenCount: number;
  averageConfidence: number;
  categoryBreakdown: Record<InsightCategory, number>;
  typeBreakdown: Record<InsightType, number>;
  feedbackStats: {
    helpful: number;
    notHelpful: number;
    veryHelpful: number;
  };
}