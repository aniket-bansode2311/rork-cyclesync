import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getCervicalMucusLogs, 
  createCervicalMucusLog, 
  updateCervicalMucusLog, 
  deleteCervicalMucusLog
} from '../../../db/utils';

export const getCervicalMucusLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getCervicalMucusLogs(ctx.user.id, input.startDate, input.endDate, input.limit);
    return logs;
  });

export const logCervicalMucusProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    type: z.enum(['dry', 'sticky', 'creamy', 'watery', 'egg_white']),
    amount: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createCervicalMucusLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateCervicalMucusLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    type: z.enum(['dry', 'sticky', 'creamy', 'watery', 'egg_white']).optional(),
    amount: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateCervicalMucusLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteCervicalMucusLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteCervicalMucusLog(input.id, ctx.user.id);
    return { success: true };
  });