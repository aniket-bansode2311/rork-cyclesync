import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getCurrentCycle, 
  getUserCycles, 
  createCycle, 
  getPeriodLogs, 
  logPeriod,
  getSymptomLogs,
  logSymptom,
  getMoodLogs,
  logMood
} from '../../../db/utils';

export const getCurrentCycleProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { user: { id: string } } }) => {
    const cycle = await getCurrentCycle(ctx.user.id);
    return cycle;
  });

export const getCyclesProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(10),
  }))
  .query(async ({ ctx, input }: { ctx: { user: { id: string } }; input: { limit: number } }) => {
    const cycles = await getUserCycles(ctx.user.id, input.limit);
    return cycles;
  });

export const startCycleProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string(),
    predictedNextPeriod: z.string().optional(),
    predictedOvulation: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { startDate: string; predictedNextPeriod?: string; predictedOvulation?: string } 
  }) => {
    const cycle = await createCycle({
      userId: ctx.user.id,
      ...input,
    });
    return cycle;
  });

export const getPeriodLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { startDate?: string; endDate?: string } 
  }) => {
    const logs = await getPeriodLogs(ctx.user.id, input.startDate, input.endDate);
    return logs;
  });

export const logPeriodProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    flowIntensity: z.enum(['spotting', 'light', 'medium', 'heavy']).optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
    cycleId: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { 
      date: string; 
      flowIntensity?: 'spotting' | 'light' | 'medium' | 'heavy'; 
      symptoms?: string[]; 
      notes?: string; 
      cycleId?: string; 
    } 
  }) => {
    const log = await logPeriod({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const getSymptomLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { startDate?: string; endDate?: string } 
  }) => {
    const logs = await getSymptomLogs(ctx.user.id, input.startDate, input.endDate);
    return logs;
  });

export const logSymptomProcedure = protectedProcedure
  .input(z.object({
    symptomId: z.string(),
    date: z.string(),
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { 
      symptomId: string; 
      date: string; 
      intensity?: 'low' | 'medium' | 'high'; 
      notes?: string; 
    } 
  }) => {
    const log = await logSymptom({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const getMoodLogsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { startDate?: string; endDate?: string } 
  }) => {
    const logs = await getMoodLogs(ctx.user.id, input.startDate, input.endDate);
    return logs;
  });

export const logMoodProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    mood: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']),
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().optional(),
    triggers: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { 
      date: string; 
      mood: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm'; 
      intensity?: 'low' | 'medium' | 'high'; 
      notes?: string; 
      triggers?: string[]; 
    } 
  }) => {
    const log = await logMood({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });