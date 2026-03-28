import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getBirthControlRecords, 
  createBirthControlRecord, 
  updateBirthControlRecord, 
  deleteBirthControlRecord,
  getBirthControlLogs,
  logBirthControlAdherence,
  getBirthControlAdherenceStats
} from '../../../db/utils';

export const getBirthControlRecordsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const records = await getBirthControlRecords(ctx.user.id);
    return records;
  });

export const createBirthControlRecordProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['pill', 'patch', 'ring', 'injection', 'implant', 'iud', 'condom', 'diaphragm', 'natural']),
    brand: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    reminderTime: z.string().optional(),
    reminderDays: z.array(z.number().min(0).max(6)).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const record = await createBirthControlRecord({
      userId: ctx.user.id,
      ...input,
    });
    return record;
  });

export const updateBirthControlRecordProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    type: z.enum(['pill', 'patch', 'ring', 'injection', 'implant', 'iud', 'condom', 'diaphragm', 'natural']).optional(),
    brand: z.string().optional(),
    endDate: z.string().optional(),
    reminderTime: z.string().optional(),
    reminderDays: z.array(z.number().min(0).max(6)).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const record = await updateBirthControlRecord(id, ctx.user.id, updateData);
    return record;
  });

export const deleteBirthControlRecordProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteBirthControlRecord(input.id, ctx.user.id);
    return { success: true };
  });

export const getBirthControlLogsProcedure = protectedProcedure
  .input(z.object({
    birthControlId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getBirthControlLogs(input.birthControlId, ctx.user.id, input.startDate, input.endDate);
    return logs;
  });

export const logBirthControlAdherenceProcedure = protectedProcedure
  .input(z.object({
    birthControlId: z.string(),
    date: z.string(),
    taken: z.boolean(),
    takenAt: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await logBirthControlAdherence({
      ...input,
      userId: ctx.user.id,
    });
    return log;
  });

export const getBirthControlAdherenceStatsProcedure = protectedProcedure
  .input(z.object({
    birthControlId: z.string(),
    days: z.number().default(30),
  }))
  .query(async ({ ctx, input }) => {
    const stats = await getBirthControlAdherenceStats(input.birthControlId, ctx.user.id, input.days);
    return stats;
  });