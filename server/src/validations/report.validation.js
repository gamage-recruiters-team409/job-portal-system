import { z } from 'zod';
import { REPORT_REASONS } from '../constants/statuses.js';

export const createReportSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),

  reason: z.string().refine(
    (value) => REPORT_REASONS.includes(value),
    'Invalid report reason'
  ),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});