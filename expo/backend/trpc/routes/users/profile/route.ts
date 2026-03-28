import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import { getUserById, getUserSettings, updateUserSettings } from '../../../db/utils';

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { user: { id: string } } }) => {
    const user = await getUserById(ctx.user.id);
    const settings = await getUserSettings(ctx.user.id);
    
    return {
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        dateOfBirth: user?.dateOfBirth,
        gender: user?.gender,
        profilePicture: user?.profilePicture,
        createdAt: user?.createdAt,
      },
      settings,
    };
  });

export const updateProfileProcedure = protectedProcedure
  .input(z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['female', 'male', 'non_binary', 'prefer_not_to_say']).optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { 
      firstName?: string; 
      lastName?: string; 
      dateOfBirth?: string; 
      gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say'; 
    } 
  }) => {
    // Update user profile logic would go here
    // For now, just return success
    return { success: true };
  });

export const updateSettingsProcedure = protectedProcedure
  .input(z.object({
    theme: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    temperatureUnit: z.string().optional(),
    weightUnit: z.string().optional(),
    cycleLength: z.number().optional(),
    periodLength: z.number().optional(),
    lutealPhaseLength: z.number().optional(),
    dailyWaterGoal: z.number().optional(),
    enableNotifications: z.boolean().optional(),
    enableDataSync: z.boolean().optional(),
    enableAnalytics: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }: { 
    ctx: { user: { id: string } }; 
    input: { 
      theme?: string; 
      language?: string; 
      timezone?: string; 
      dateFormat?: string; 
      temperatureUnit?: string; 
      weightUnit?: string; 
      cycleLength?: number; 
      periodLength?: number; 
      lutealPhaseLength?: number; 
      dailyWaterGoal?: number; 
      enableNotifications?: boolean; 
      enableDataSync?: boolean; 
      enableAnalytics?: boolean; 
    } 
  }) => {
    const settings = await updateUserSettings(ctx.user.id, input);
    return settings;
  });