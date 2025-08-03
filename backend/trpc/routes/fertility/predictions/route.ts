import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getFertilityPredictions,
  getOvulationPrediction,
  getFertilityWindow,
  getCyclePredictions
} from '../../../db/utils';

export const getFertilityPredictionsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const predictions = await getFertilityPredictions(ctx.user.id);
    return predictions;
  });

export const getOvulationPredictionProcedure = protectedProcedure
  .input(z.object({
    cycleId: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const prediction = await getOvulationPrediction(ctx.user.id, input.cycleId);
    return prediction;
  });

export const getFertilityWindowProcedure = protectedProcedure
  .input(z.object({
    date: z.string().optional(), // If not provided, uses current date
  }))
  .query(async ({ ctx, input }) => {
    const window = await getFertilityWindow(ctx.user.id, input.date);
    return window;
  });

export const getCyclePredictionsProcedure = protectedProcedure
  .input(z.object({
    months: z.number().default(3), // Number of months to predict
  }))
  .query(async ({ ctx, input }) => {
    const predictions = await getCyclePredictions(ctx.user.id, input.months);
    return predictions;
  });