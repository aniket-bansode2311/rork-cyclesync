import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../../../create-context';
import { 
  getForumReplies, 
  createForumReply, 
  updateForumReply, 
  deleteForumReply
} from '../../../db/utils';

export const getForumRepliesProcedure = publicProcedure
  .input(z.object({
    threadId: z.string(),
    parentReplyId: z.string().optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const replies = await getForumReplies(input);
    return replies;
  });

export const createForumReplyProcedure = protectedProcedure
  .input(z.object({
    threadId: z.string(),
    content: z.string().min(1),
    parentReplyId: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const reply = await createForumReply({
      authorId: ctx.user.id,
      ...input,
    });
    return reply;
  });

export const updateForumReplyProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    content: z.string().min(1),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const reply = await updateForumReply(id, ctx.user.id, updateData);
    return reply;
  });

export const deleteForumReplyProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteForumReply(input.id, ctx.user.id);
    return { success: true };
  });