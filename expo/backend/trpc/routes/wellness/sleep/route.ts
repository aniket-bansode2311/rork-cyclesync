import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getSleepLogs, 
  createSleepLog, 
  updateSleepLog, 
  deleteSleepLog,
  getSleepTrends
} from '../../../db/utils';

export const getSleepLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getSleepLogs(ctx.user.id, input.startDate, input.endDate, input.limit);
    return logs;
  });

export const logSleepProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    bedtime: z.string().optional(), // ISO timestamp
    wakeTime: z.string().optional(), // ISO timestamp
    duration: z.number().optional(), // in minutes
    quality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createSleepLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateSleepLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    bedtime: z.string().optional(),
    wakeTime: z.string().optional(),
    duration: z.number().optional(),
    quality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateSleepLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteSleepLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteSleepLog(input.id, ctx.user.id);
    return { success: true };
  });

export const getSleepTrendsProcedure = protectedProcedure
  .input(z.object({
    days: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const trends = await getSleepTrends(ctx.user.id, input.days);
    return trends;
  });