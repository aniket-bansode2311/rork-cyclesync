import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getNutritionLogs, 
  createNutritionLog, 
  updateNutritionLog, 
  deleteNutritionLog,
  getNutritionSummary
} from '../../../db/utils';

export const getNutritionLogsProcedure = protectedProcedure
  .input(z.object({
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    mealType: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const logs = await getNutritionLogs(ctx.user.id, input);
    return logs;
  });

export const logNutritionProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
    foodItem: z.string(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const log = await createNutritionLog({
      userId: ctx.user.id,
      ...input,
    });
    return log;
  });

export const updateNutritionLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    foodItem: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const log = await updateNutritionLog(id, ctx.user.id, updateData);
    return log;
  });

export const deleteNutritionLogProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteNutritionLog(input.id, ctx.user.id);
    return { success: true };
  });

export const getNutritionSummaryProcedure = protectedProcedure
  .input(z.object({
    date: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const summary = await getNutritionSummary(ctx.user.id, input.date);
    return summary;
  });