import { z } from 'zod';
import { REPORT_REASONS } from '../constants/statuses.js';

export const createReportSchema = z.object({
  jobId: z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid job ID'
),

  reason: z.string().refine(
    (value) => REPORT_REASONS.includes(value),
    'Invalid report reason'
  ),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});