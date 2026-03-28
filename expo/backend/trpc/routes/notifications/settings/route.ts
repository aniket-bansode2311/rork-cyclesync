import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getNotificationSettings,
  updateNotificationSettings,
  createNotificationSetting,
  deleteNotificationSetting
} from '../../../db/utils';

export const getNotificationSettingsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const settings = await getNotificationSettings(ctx.user.id);
    return settings;
  });

export const updateNotificationSettingProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    isEnabled: z.boolean().optional(),
    time: z.string().optional(),
    daysInAdvance: z.number().optional(),
    customMessage: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const setting = await updateNotificationSettings(id, ctx.user.id, updateData);
    return setting;
  });

export const createNotificationSettingProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['period_reminder', 'ovulation_reminder', 'birth_control_reminder', 'symptom_log_reminder', 'appointment_reminder']),
    isEnabled: z.boolean().default(true),
    time: z.string().optional(),
    daysInAdvance: z.number().optional(),
    customMessage: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const setting = await createNotificationSetting({
      userId: ctx.user.id,
      ...input,
    });
    return setting;
  });

export const deleteNotificationSettingProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteNotificationSetting(input.id, ctx.user.id);
    return { success: true };
  });