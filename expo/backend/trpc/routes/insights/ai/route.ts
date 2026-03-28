import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  generateAIInsights,
  getUserInsights,
  getCycleInsights,
  getHealthInsights,
  getPersonalizedRecommendations
} from '../../../db/utils';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const insightTypeSchema = z.enum(['cycle', 'symptoms', 'mood', 'fertility', 'wellness', 'general']);
const timeframeSchema = z.enum(['week', 'month', 'quarter', 'year']);
const healthCategorySchema = z.enum(['nutrition', 'activity', 'sleep', 'mood', 'symptoms']);
const recommendationCategorySchema = z.enum(['cycle', 'fertility', 'wellness', 'nutrition', 'activity', 'sleep']);

export const generateAIInsightsProcedure = protectedProcedure
  .input(z.object({
    type: insightTypeSchema,
    timeframe: timeframeSchema.default('month'),
    forceRefresh: z.boolean().default(false),
    maxInsights: z.number().min(1).max(20).default(5),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { type: 'cycle' | 'symptoms' | 'mood' | 'fertility' | 'wellness' | 'general'; timeframe: 'week' | 'month' | 'quarter' | 'year'; forceRefresh: boolean; maxInsights: number } 
  }) => {
    try {
      console.log(`🤖 Generating AI insights for user ${ctx.user.id}:`, input);
      
      const insights = await generateAIInsights(
        ctx.user.id, 
        input.type, 
        input.timeframe,
        {
          forceRefresh: input.forceRefresh,
          maxInsights: input.maxInsights,
        }
      );
      
      console.log(`✅ Generated ${insights.length} insights for user ${ctx.user.id}`);
      return {
        insights,
        generatedAt: new Date().toISOString(),
        count: insights.length,
      };
    } catch (error) {
      console.error('❌ Error dismissing insight:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to dismiss insight. Please try again later.',
        cause: error,
      });
    }
  });

export const getInsightAnalyticsProcedure = protectedProcedure
  .input(z.object({
    timeframe: timeframeSchema.default('month'),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { timeframe: 'week' | 'month' | 'quarter' | 'year' } 
  }) => {
    try {
      // This would typically fetch analytics from the database
      const analytics = {
        totalInsights: 15,
        readInsights: 12,
        actionTakenCount: 8,
        averageConfidence: 0.78,
        categoryBreakdown: {
          cycle: 5,
          symptoms: 4,
          mood: 3,
          fertility: 2,
          wellness: 1,
        },
        feedbackStats: {
          helpful: 8,
          notHelpful: 2,
          veryHelpful: 5,
        },
        timeframe: input.timeframe,
        generatedAt: new Date().toISOString(),
      };
      
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching insight analytics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch insight analytics. Please try again later.',
        cause: error,
      });
    }
  });.error('❌ Error generating AI insights:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate AI insights. Please try again later.',
        cause: error,
      });
    }
  });

export const getUserInsightsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(50).default(10),
    type: insightTypeSchema.optional(),
    includeRead: z.boolean().default(true),
    includeDismissed: z.boolean().default(false),
    sortBy: z.enum(['date', 'priority', 'confidence']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { limit: number; type?: 'cycle' | 'symptoms' | 'mood' | 'fertility' | 'wellness' | 'general'; includeRead: boolean; includeDismissed: boolean; sortBy: 'date' | 'priority' | 'confidence'; sortOrder: 'asc' | 'desc' } 
  }) => {
    try {
      const insights = await getUserInsights(ctx.user.id, {
        limit: input.limit,
        type: input.type,
        includeRead: input.includeRead,
        includeDismissed: input.includeDismissed,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
      });
      
      return {
        insights,
        totalCount: insights.length,
        unreadCount: insights.filter((i: any) => !i.isRead).length,
        highPriorityCount: insights.filter((i: any) => i.priority === 'high' || i.priority === 'urgent').length,
      };
    } catch (error) {
      console.error('❌ Error fetching user insights:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch insights. Please try again later.',
        cause: error,
      });
    }
  });

export const getCycleInsightsProcedure = protectedProcedure
  .input(z.object({
    cycleId: z.string().optional(),
    months: z.number().min(1).max(12).default(3),
    includePatterns: z.boolean().default(true),
    includePredictions: z.boolean().default(true),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { cycleId?: string; months: number; includePatterns: boolean; includePredictions: boolean } 
  }) => {
    try {
      const insights = await getCycleInsights(ctx.user.id, {
        cycleId: input.cycleId,
        months: input.months,
        includePatterns: input.includePatterns,
        includePredictions: input.includePredictions,
      });
      
      return {
        insights,
        cycleId: input.cycleId,
        analysisMonths: input.months,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error fetching cycle insights:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cycle insights. Please try again later.',
        cause: error,
      });
    }
  });

export const getHealthInsightsProcedure = protectedProcedure
  .input(z.object({
    categories: z.array(healthCategorySchema).optional(),
    timeframe: z.enum(['week', 'month', 'quarter']).default('month'),
    includeCorrelations: z.boolean().default(true),
    minConfidence: z.number().min(0).max(1).default(0.5),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { categories?: ('nutrition' | 'activity' | 'sleep' | 'mood' | 'symptoms')[]; timeframe: 'week' | 'month' | 'quarter'; includeCorrelations: boolean; minConfidence: number } 
  }) => {
    try {
      const insights = await getHealthInsights(ctx.user.id, {
        categories: input.categories,
        timeframe: input.timeframe,
        includeCorrelations: input.includeCorrelations,
        minConfidence: input.minConfidence,
      });
      
      return {
        insights,
        categories: input.categories || ['nutrition', 'activity', 'sleep', 'mood', 'symptoms'],
        timeframe: input.timeframe,
        correlationsIncluded: input.includeCorrelations,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error fetching health insights:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch health insights. Please try again later.',
        cause: error,
      });
    }
  });

export const getPersonalizedRecommendationsProcedure = protectedProcedure
  .input(z.object({
    category: recommendationCategorySchema.optional(),
    limit: z.number().min(1).max(20).default(5),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    excludeCompleted: z.boolean().default(true),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { category?: 'cycle' | 'fertility' | 'wellness' | 'nutrition' | 'activity' | 'sleep'; limit: number; priority?: 'low' | 'medium' | 'high' | 'urgent'; excludeCompleted: boolean } 
  }) => {
    try {
      const recommendations = await getPersonalizedRecommendations(ctx.user.id, {
        category: input.category,
        limit: input.limit,
        priority: input.priority,
        excludeCompleted: input.excludeCompleted,
      });
      
      return {
        recommendations,
        category: input.category,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error fetching personalized recommendations:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recommendations. Please try again later.',
        cause: error,
      });
    }
  });

// New procedures for enhanced AI insights functionality
export const submitInsightFeedbackProcedure = protectedProcedure
  .input(z.object({
    insightId: z.string(),
    feedbackType: z.enum(['helpful', 'not_helpful', 'very_helpful']),
    notes: z.string().optional(),
    actionTaken: z.boolean().default(false),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { insightId: string; feedbackType: 'helpful' | 'not_helpful' | 'very_helpful'; notes?: string; actionTaken: boolean } 
  }) => {
    try {
      // This would typically update the insight feedback in the database
      console.log(`📝 Insight feedback submitted for user ${ctx.user.id}:`, input);
      
      return {
        success: true,
        feedbackId: `feedback_${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error submitting insight feedback:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit feedback. Please try again later.',
        cause: error,
      });
    }
  });

export const markInsightAsReadProcedure = protectedProcedure
  .input(z.object({
    insightId: z.string(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { insightId: string } 
  }) => {
    try {
      console.log(`👁️ Marking insight as read for user ${ctx.user.id}:`, input.insightId);
      
      return {
        success: true,
        markedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error marking insight as read:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark insight as read. Please try again later.',
        cause: error,
      });
    }
  });

export const dismissInsightProcedure = protectedProcedure
  .input(z.object({
    insightId: z.string(),
    reason: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { insightId: string; reason?: string } 
  }) => {
    try {
      console.log(`🚫 Dismissing insight for user ${ctx.user.id}:`, input);
      
      return {
        success: true,
        dismissedAt: new Date().toISOString(),
      };
    } catch (error) {
      console