import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getBBTLogs, 
  createBBTLog, 
  updateBBTLog, 
  deleteBBTLog,
  getBBTTrends
} from '../../../db/utils';

export const getBBTLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getBBTLogs(ctx.user.id, input.startDate, input.endDate, input.limit);
    return logs;
  });

export const logBBTProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    temperature: z.number().min(90).max(110), // Reasonable temperature range in Fahrenheit
    time: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createBBTLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateBBTLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    temperature: z.number().min(90).max(110).optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateBBTLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteBBTLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteBBTLog(input.id, ctx.user.id);
    return { success: true };
  });

export const getBBTTrendsProcedure = protectedProcedure
  .input(z.object({
    days: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const trends = await getBBTTrends(ctx.user.id, input.days);
    return trends;
  });