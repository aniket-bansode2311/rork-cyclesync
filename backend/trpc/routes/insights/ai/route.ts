import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  generateAIInsights,
  getUserInsights,
  getCycleInsights,
  getHealthInsights,
  getPersonalizedRecommendations
} from '../../../db/utils';

export const generateAIInsightsProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['cycle', 'symptoms', 'mood', 'fertility', 'wellness', 'general']),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  }))
  .mutation(async ({ ctx, input }) => {
    const insights = await generateAIInsights(ctx.user.id, input.type, input.timeframe);
    return insights;
  });

export const getUserInsightsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(10),
    type: z.enum(['cycle', 'symptoms', 'mood', 'fertility', 'wellness', 'general']).optional(),
  }))
  .query(async ({ ctx, input }) => {
    const insights = await getUserInsights(ctx.user.id, input.limit, input.type);
    return insights;
  });

export const getCycleInsightsProcedure = protectedProcedure
  .input(z.object({
    cycleId: z.string().optional(),
    months: z.number().default(3),
  }))
  .query(async ({ ctx, input }) => {
    const insights = await getCycleInsights(ctx.user.id, input.cycleId, input.months);
    return insights;
  });

export const getHealthInsightsProcedure = protectedProcedure
  .input(z.object({
    categories: z.array(z.enum(['nutrition', 'activity', 'sleep', 'mood', 'symptoms'])).optional(),
    timeframe: z.enum(['week', 'month', 'quarter']).default('month'),
  }))
  .query(async ({ ctx, input }) => {
    const insights = await getHealthInsights(ctx.user.id, input.categories, input.timeframe);
    return insights;
  });

export const getPersonalizedRecommendationsProcedure = protectedProcedure
  .input(z.object({
    category: z.enum(['cycle', 'fertility', 'wellness', 'nutrition', 'activity', 'sleep']).optional(),
    limit: z.number().default(5),
  }))
  .query(async ({ ctx, input }) => {
    const recommendations = await getPersonalizedRecommendations(ctx.user.id, input.category, input.limit);
    return recommendations;
  });