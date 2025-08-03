import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getPregnancies, 
  createPregnancy, 
  updatePregnancy, 
  getPregnancyLogs,
  createPregnancyLog,
  updatePregnancyLog,
  getPostpartumLogs,
  createPostpartumLog
} from '../../../db/utils';

export const getPregnanciesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const pregnancies = await getPregnancies(ctx.user.id);
    return pregnancies;
  });

export const createPregnancyProcedure = protectedProcedure
  .input(z.object({
    conceptionDate: z.string().optional(),
    dueDate: z.string(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const pregnancy = await createPregnancy({
      userId: ctx.user.id,
      ...input,
    });
    return pregnancy;
  });

export const updatePregnancyProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    conceptionDate: z.string().optional(),
    dueDate: z.string().optional(),
    deliveryDate: z.string().optional(),
    outcome: z.enum(['live_birth', 'miscarriage', 'stillbirth', 'ongoing']).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const pregnancy = await updatePregnancy(id, ctx.user.id, updateData);
    return pregnancy;
  });

export const getPregnancyLogsProcedure = protectedProcedure
  .input(z.object({
    pregnancyId: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getPregnancyLogs(input.pregnancyId, ctx.user.id);
    return logs;
  });

export const createPregnancyLogProcedure = protectedProcedure
  .input(z.object({
    pregnancyId: z.string(),
    week: z.number().min(1).max(42),
    weight: z.number().optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
    appointments: z.array(z.object({
      date: z.string(),
      type: z.string(),
      notes: z.string().optional(),
    })).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createPregnancyLog({
      ...input,
      userId: ctx.user.id,
    });
    return log;
  });

export const updatePregnancyLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    weight: z.number().optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
    appointments: z.array(z.object({
      date: z.string(),
      type: z.string(),
      notes: z.string().optional(),
    })).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updatePregnancyLog(id, ctx.user.id, updateData);
    return log;
  });

export const getPostpartumLogsProcedure = protectedProcedure
  .input(z.object({
    pregnancyId: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getPostpartumLogs(input.pregnancyId, ctx.user.id);
    return logs;
  });

export const createPostpartumLogProcedure = protectedProcedure
  .input(z.object({
    pregnancyId: z.string(),
    date: z.string(),
    bleeding: z.enum(['spotting', 'light', 'medium', 'heavy']).optional(),
    mood: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    breastfeeding: z.boolean().optional(),
    sleep: z.number().optional(), // hours
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createPostpartumLog({
      ...input,
      userId: ctx.user.id,
    });
    return log;
  });