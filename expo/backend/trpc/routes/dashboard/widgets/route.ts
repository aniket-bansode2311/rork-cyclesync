import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getDashboardWidgets,
  updateDashboardWidget,
  createDashboardWidget,
  deleteDashboardWidget,
  reorderDashboardWidgets
} from '../../../db/utils';

export const getDashboardWidgetsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const widgets = await getDashboardWidgets(ctx.user.id);
    return widgets;
  });

export const updateDashboardWidgetProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    position: z.number().optional(),
    isVisible: z.boolean().optional(),
    configuration: z.record(z.any()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    const widget = await updateDashboardWidget(id, ctx.user.id, updateData);
    return widget;
  });

export const createDashboardWidgetProcedure = protectedProcedure
  .input(z.object({
    widgetType: z.string(),
    position: z.number(),
    isVisible: z.boolean().default(true),
    configuration: z.record(z.any()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const widget = await createDashboardWidget({
      userId: ctx.user.id,
      ...input,
    });
    return widget;
  });

export const deleteDashboardWidgetProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    await deleteDashboardWidget(input.id, ctx.user.id);
    return { success: true };
  });

export const reorderDashboardWidgetsProcedure = protectedProcedure
  .input(z.object({
    widgets: z.array(z.object({
      id: z.string(),
      position: z.number(),
    })),
  }))
  .mutation(async ({ ctx, input }) => {
    await reorderDashboardWidgets(ctx.user.id, input.widgets);
    return { success: true };
  });