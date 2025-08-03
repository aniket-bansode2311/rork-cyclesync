import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getActivityLogs, 
  createActivityLog, 
  updateActivityLog, 
  deleteActivityLog,
  getActivitySummary
} from '../../../db/utils';

export const getActivityLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: z.enum(['cardio', 'strength', 'yoga', 'walking', 'running', 'cycling', 'swimming', 'other']).optional(),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getActivityLogs(ctx.user.id, input);
    return logs;
  });

export const logActivityProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    type: z.enum(['cardio', 'strength', 'yoga', 'walking', 'running', 'cycling', 'swimming', 'other']),
    duration: z.number().optional(), // in minutes
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    calories: z.number().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createActivityLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateActivityLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    type: z.enum(['cardio', 'strength', 'yoga', 'walking', 'running', 'cycling', 'swimming', 'other']).optional(),
    duration: z.number().optional(),
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    calories: z.number().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateActivityLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteActivityLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteActivityLog(input.id, ctx.user.id);
    return { success: true };
  });

export const getActivitySummaryProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string(),
    endDate: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const summary = await getActivitySummary(ctx.user.id, input.startDate, input.endDate);
    return summary;
  });