import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { 
  getPrivacyConsents,
  updatePrivacyConsent,
  createDataExportRequest,
  getDataExportRequests,
  createAccountDeletionRequest,
  cancelAccountDeletionRequest,
  getAccountDeletionRequest
} from '../../../db/utils';

export const getPrivacyConsentsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const consents = await getPrivacyConsents(ctx.user.id);
    return consents;
  });

export const updatePrivacyConsentProcedure = protectedProcedure
  .input(z.object({
    consentType: z.enum(['data_collection', 'analytics', 'research', 'marketing', 'third_party_sharing']),
    isGranted: z.boolean(),
  }))
  .mutation(async ({ ctx, input }) => {
    const consent = await updatePrivacyConsent(ctx.user.id, input.consentType, input.isGranted);
    return consent;
  });

export const requestDataExportProcedure = protectedProcedure
  .input(z.object({
    format: z.enum(['json', 'csv', 'pdf']).default('json'),
  }))
  .mutation(async ({ ctx, input }) => {
    const request = await createDataExportRequest(ctx.user.id, input.format);
    return request;
  });

export const getDataExportRequestsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const requests = await getDataExportRequests(ctx.user.id);
    return requests;
  });

export const requestAccountDeletionProcedure = protectedProcedure
  .input(z.object({
    reason: z.string().optional(),
    gracePeriodDays: z.number().default(30),
  }))
  .mutation(async ({ ctx, input }) => {
    const request = await createAccountDeletionRequest(ctx.user.id, input.reason, input.gracePeriodDays);
    return request;
  });

export const cancelAccountDeletionProcedure = protectedProcedure
  .input(z.object({
    cancellationToken: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const result = await cancelAccountDeletionRequest(ctx.user.id, input.cancellationToken);
    return result;
  });

export const getAccountDeletionRequestProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const request = await getAccountDeletionRequest(ctx.user.id);
    return request;
  });