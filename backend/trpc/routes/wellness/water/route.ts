import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { getWaterIntake, logWaterIntake, getUserSettings } from '../../../db/utils';

export const getWaterIntakeProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { date: string } 
  }) => {
    const intake = await getWaterIntake(ctx.user.id, input.date);
    const settings = await getUserSettings(ctx.user.id);
    
    return {
      intake,
      dailyGoal: settings?.dailyWaterGoal || 2000,
    };
  });

export const logWaterIntakeProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    amount: z.number(),
    goal: z.number().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { date: string; amount: number; goal?: number } 
  }) => {
    const log = await logWaterIntake({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });