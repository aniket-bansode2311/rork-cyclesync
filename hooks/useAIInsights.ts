import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AIInsight, 
  InsightFeedback, 
  InsightContextType, 
  InsightGenerationOptions,
  InsightCategory,
  InsightPriority,
  InsightAnalytics,
  InsightType
} from '@/types/insights';
import { AIInsightsService } from '@/utils/aiInsightsService';
import { usePeriods } from './usePeriods';
import { useSymptoms } from './useSymptoms';

const INSIGHTS_STORAGE_KEY = 'ai_insights';
const LAST_SYNC_STORAGE_KEY = 'insights_last_sync';

export function useAIInsights(): InsightContextType {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | undefined>();

  const { periods } = usePeriods();
  const { loggedSymptoms, loggedMoods } = useSymptoms();

  // Load insights from storage
  const loadInsights = useCallback(async () => {
    try {
      const [storedInsights, storedLastSync] = await Promise.all([
        AsyncStorage.getItem(INSIGHTS_STORAGE_KEY),
        AsyncStorage.getItem(LAST_SYNC_STORAGE_KEY),
      ]);

      if (storedInsights) {
        const parsedInsights = JSON.parse(storedInsights);
        setInsights(parsedInsights);
      }

      if (storedLastSync) {
        setLastSyncAt(storedLastSync);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save insights to storage
  const saveInsights = useCallback(async (newInsights: AIInsight[]) => {
    try {
      await AsyncStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(newInsights));
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }, []);

  // Generate new insights with options
  const generateInsights = useCallback(async (options?: InsightGenerationOptions) => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      // Generate user data summary
      const dataSummary = AIInsightsService.generateUserDataSummary(
        periods,
        loggedSymptoms,
        loggedMoods
      );

      // Generate insights using AI service
      const newInsights = await AIInsightsService.generateInsights(dataSummary);

      // Apply options filtering
      let filteredInsights = newInsights;
      if (options?.categories) {
        filteredInsights = filteredInsights.filter(insight => 
          options.categories!.includes(insight.category)
        );
      }

      // Remove expired insights unless explicitly included
      if (!options?.includeExpired) {
        const now = new Date();
        filteredInsights = filteredInsights.filter(insight => 
          !insight.expiresAt || new Date(insight.expiresAt) > now
        );
      }

      // Limit number of insights
      if (options?.maxInsights) {
        filteredInsights = filteredInsights.slice(0, options.maxInsights);
      }

      // Filter out insights that are too similar to existing ones (unless force refresh)
      if (!options?.forceRefresh) {
        const existingTitles = insights.map(i => i.title.toLowerCase());
        filteredInsights = filteredInsights.filter(
          insight => !existingTitles.includes(insight.title.toLowerCase())
        );
      }

      if (filteredInsights.length > 0 || options?.forceRefresh) {
        const updatedInsights = options?.forceRefresh 
          ? filteredInsights
          : [...filteredInsights, ...insights].slice(0, 15); // Keep more insights
        setInsights(updatedInsights);
        await saveInsights(updatedInsights);
      }

      const now = new Date().toISOString();
      setLastSyncAt(now);
      await AsyncStorage.setItem(LAST_SYNC_STORAGE_KEY, now);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [periods, loggedSymptoms, loggedMoods, insights, isGenerating, saveInsights]);

  // Mark insight as read
  const markAsRead = useCallback(async (insightId: string) => {
    const updatedInsights = insights.map(insight =>
      insight.id === insightId ? { ...insight, isRead: true } : insight
    );
    setInsights(updatedInsights);
    await saveInsights(updatedInsights);
  }, [insights, saveInsights]);

  // Submit feedback for an insight
  const submitFeedback = useCallback(async (feedback: InsightFeedback) => {
    try {
      // Submit to backend service
      await AIInsightsService.submitFeedback(feedback.insightId, feedback);

      // Update local insight with feedback
      const updatedInsights = insights.map(insight =>
        insight.id === feedback.insightId
          ? {
              ...insight,
              feedback: {
                type: feedback.type,
                submittedAt: feedback.submittedAt,
                notes: feedback.notes,
              },
            }
          : insight
      );
      setInsights(updatedInsights);
      await saveInsights(updatedInsights);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }, [insights, saveInsights]);

  // Dismiss an insight (mark as dismissed instead of removing)
  const dismissInsight = useCallback(async (insightId: string) => {
    const updatedInsights = insights.map(insight =>
      insight.id === insightId ? { ...insight, isDismissed: true } : insight
    );
    setInsights(updatedInsights);
    await saveInsights(updatedInsights);
  }, [insights, saveInsights]);

  // Mark action taken on an insight
  const markActionTaken = useCallback(async (insightId: string) => {
    const updatedInsights = insights.map(insight =>
      insight.id === insightId ? { ...insight, actionTaken: true, isRead: true } : insight
    );
    setInsights(updatedInsights);
    await saveInsights(updatedInsights);
  }, [insights, saveInsights]);

  // Get insights by category
  const getInsightsByCategory = useCallback((category: InsightCategory) => {
    return insights.filter(insight => 
      insight.category === category && !insight.isDismissed
    );
  }, [insights]);

  // Get insights by priority
  const getInsightsByPriority = useCallback((priority: InsightPriority) => {
    return insights.filter(insight => 
      insight.priority === priority && !insight.isDismissed
    );
  }, [insights]);

  // Search insights
  const searchInsights = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return insights.filter(insight => 
      !insight.isDismissed && (
        insight.title.toLowerCase().includes(lowercaseQuery) ||
        insight.content.toLowerCase().includes(lowercaseQuery) ||
        insight.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  }, [insights]);

  // Refresh insights (clear and regenerate)
  const refreshInsights = useCallback(async () => {
    setInsights([]);
    await AsyncStorage.removeItem(INSIGHTS_STORAGE_KEY);
    await generateInsights();
  }, [generateInsights]);

  // Get active insights (not dismissed and not expired)
  const activeInsights = useMemo(() => {
    const now = new Date();
    return insights.filter(insight => 
      !insight.isDismissed && 
      (!insight.expiresAt || new Date(insight.expiresAt) > now)
    );
  }, [insights]);

  // Get insight analytics
  const getInsightAnalytics = useCallback((): InsightAnalytics => {
    const totalInsights = activeInsights.length;
    const readInsights = activeInsights.filter(i => i.isRead).length;
    const actionTakenCount = activeInsights.filter(i => i.actionTaken).length;
    const averageConfidence = totalInsights > 0 
      ? activeInsights.reduce((sum, i) => sum + i.confidence, 0) / totalInsights 
      : 0;

    const categoryBreakdown = activeInsights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {} as Record<InsightCategory, number>);

    const typeBreakdown = activeInsights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<InsightType, number>);

    const feedbackStats = activeInsights.reduce((acc, insight) => {
      if (insight.feedback) {
        if (insight.feedback.type === 'helpful') {
          acc.helpful = (acc.helpful || 0) + 1;
        } else if (insight.feedback.type === 'not_helpful') {
          acc.notHelpful = (acc.notHelpful || 0) + 1;
        } else if (insight.feedback.type === 'very_helpful') {
          acc.veryHelpful = (acc.veryHelpful || 0) + 1;
        }
      }
      return acc;
    }, { helpful: 0, notHelpful: 0, veryHelpful: 0 });

    return {
      totalInsights,
      readInsights,
      actionTakenCount,
      averageConfidence,
      categoryBreakdown,
      typeBreakdown,
      feedbackStats,
    };
  }, [activeInsights]);

  // Auto-generate insights when data changes significantly
  useEffect(() => {
    if (!isLoading && periods.length > 0 && loggedSymptoms.length > 0) {
      const shouldGenerate = !lastSyncAt || 
        (new Date().getTime() - new Date(lastSyncAt).getTime()) > 24 * 60 * 60 * 1000; // 24 hours

      if (shouldGenerate && activeInsights.length < 3) {
        generateInsights({ maxInsights: 5 });
      }
    }
  }, [periods.length, loggedSymptoms.length, loggedMoods.length, isLoading, lastSyncAt, activeInsights.length, generateInsights]);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights: activeInsights,
    isLoading,
    isGenerating,
    lastSyncAt,
    generateInsights,
    markAsRead,
    submitFeedback,
    dismissInsight,
    refreshInsights,
    markActionTaken,
    getInsightsByCategory,
    getInsightsByPriority,
    searchInsights,
    getInsightAnalytics,
  };
}