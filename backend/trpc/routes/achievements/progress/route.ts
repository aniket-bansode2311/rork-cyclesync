import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { getUserAchievements, updateAchievementProgress, getUserStats } from '../../../db/utils';

export const getAchievementsProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { user: { id: string } } }) => {
    const achievements = await getUserAchievements(ctx.user.id);
    return achievements;
  });

export const updateProgressProcedure = protectedProcedure
  .input(z.object({
    achievementId: z.string(),
    progress: z.number(),
  }))
  .mutation(async ({ ctx, input }: { ctx: { user: { id: string } }; input: { achievementId: string; progress: number } }) => {
    const achievement = await updateAchievementProgress(
      ctx.user.id,
      input.achievementId,
      input.progress
    );
    return achievement;
  });

export const getUserStatsProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { user: { id: string } } }) => {
    const stats = await getUserStats(ctx.user.id);
    return stats;
  });