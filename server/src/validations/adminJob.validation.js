import { z } from 'zod';
import { JOB_STATUSES } from '../constants/statuses.js';
import mongoose from 'mongoose';

// Validation for GET /api/v1/admin/jobs query parameters
export const getJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z
    .string()
    .refine((val) => Object.values(JOB_STATUSES).includes(val), {
      message: 'Invalid job status',
    })
    .optional(),
});

// Validation for route parameters requiring a valid MongoDB ObjectId
export const jobIdParamSchema = z.object({
  jobId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Job ID format',
  }),
});

// Validation for PATCH /api/v1/admin/jobs/:jobId/moderation
export const moderateJobSchema = z.object({
  status: z
    .string()
    .refine(
      (val) =>
        [JOB_STATUSES.PUBLISHED, JOB_STATUSES.SUSPENDED, JOB_STATUSES.REJECTED].includes(val),
      {
        message: `Status must be '${JOB_STATUSES.PUBLISHED}', '${JOB_STATUSES.SUSPENDED}' or '${JOB_STATUSES.REJECTED}' for moderation`,
      }
    ),
  reviewNote: z
    .string({
      required_error: 'Review note is required for moderation',
    })
    .trim()
    .min(10, 'Review note must be at least 10 characters long')
    .max(500, 'Review note cannot exceed 500 characters'),
});
