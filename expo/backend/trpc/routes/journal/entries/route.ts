import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getJournalEntries, 
  createJournalEntry, 
  updateJournalEntry, 
  deleteJournalEntry,
  getJournalStats
} from '../../../db/utils';

export const getJournalEntriesProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    mood: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    limit: z.number().default(20),
    offset: z.number().default(0),
  }))
  .query(async ({ ctx, input }) => {
    const entries = await getJournalEntries(ctx.user.id, input);
    return entries;
  });

export const createJournalEntryProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    title: z.string().optional(),
    content: z.string(),
    mood: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const entry = await createJournalEntry({
      userId: ctx.user.id,
      ...input,
    });
    return entry;
  });

export const updateJournalEntryProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    mood: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']).optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const entry = await updateJournalEntry(id, ctx.user.id, updateData);
    return entry;
  });

export const deleteJournalEntryProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteJournalEntry(input.id, ctx.user.id);
    return { success: true };
  });

export const getJournalStatsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const stats = await getJournalStats(ctx.user.id, input.startDate, input.endDate);
    return stats;
  });