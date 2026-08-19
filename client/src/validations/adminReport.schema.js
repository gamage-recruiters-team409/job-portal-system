/**
 * @file adminReport.schema.js
 * @description Zod validation schemas for Admin Reported Jobs frontend forms.
 * @module Validations/AdminReport
 */

import { z } from 'zod';

/* ─── AdminReport Schema ─────────────────────────────────────────────────────── */

export const reviewReportSchema = z.object({
  reviewNote: z
    .string()
    .min(1, 'Internal note is required')
    .min(10, 'Internal note must be at least 10 characters long')
    .max(500, 'Internal note cannot exceed 500 characters')
    .trim(),
});
