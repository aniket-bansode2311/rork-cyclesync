import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../../../create-context';
import { 
  getForumThreads, 
  createForumThread, 
  updateForumThread, 
  deleteForumThread,
  getForumThread,
  incrementThreadViews
} from '../../../db/utils';

export const getForumThreadsProcedure = publicProcedure
  .input(z.object({
    categoryId: z.string().optional(),
    category: z.enum(['general', 'periods', 'fertility', 'pregnancy', 'menopause', 'birth_control', 'wellness', 'support']).optional(),
    tags: z.array(z.string()).optional(),
    sortBy: z.enum(['recent', 'popular', 'replies']).default('recent'),
    limit: z.number().default(20),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const threads = await getForumThreads(input);
    return threads;
  });

export const getForumThreadProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    incrementViews: z.boolean().default(true),
  }))
  .query(async ({ input }) => {
    const thread = await getForumThread(input.id);
    
    if (input.incrementViews && thread) {
      await incrementThreadViews(input.id);
    }
    
    return thread;
  });

export const createForumThreadProcedure = protectedProcedure
  .input(z.object({
    categoryId: z.string(),
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const thread = await createForumThread({
      authorId: ctx.user.id,
      ...input,
    });
    return thread;
  });

export const updateForumThreadProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const thread = await updateForumThread(id, ctx.user.id, updateData);
    return thread;
  });

export const deleteForumThreadProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteForumThread(input.id, ctx.user.id);
    return { success: true };
  });