import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getMenopauseLogs, 
  createMenopauseLog, 
  updateMenopauseLog, 
  deleteMenopauseLog,
  getMenopauseTrends
} from '../../../db/utils';

export const getMenopauseLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getMenopauseLogs(ctx.user.id, input.startDate, input.endDate, input.limit);
    return logs;
  });

export const logMenopauseProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    hotFlashes: z.number().min(0).optional(),
    nightSweats: z.boolean().optional(),
    moodChanges: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createMenopauseLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateMenopauseLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    hotFlashes: z.number().min(0).optional(),
    nightSweats: z.boolean().optional(),
    moodChanges: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateMenopauseLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteMenopauseLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteMenopauseLog(input.id, ctx.user.id);
    return { success: true };
  });

export const getMenopauseTrendsProcedure = protectedProcedure
  .input(z.object({
    days: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const trends = await getMenopauseTrends(ctx.user.id, input.days);
    return trends;
  });