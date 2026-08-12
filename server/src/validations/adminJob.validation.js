import { z } from 'zod';
import { JOB_STATUSES } from '../constants/statuses.js';
import mongoose from 'mongoose';

// Validation for GET /api/v1/admin/jobs query parameters
export const getJobsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').optional(),
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
    .refine((val) => [JOB_STATUSES.SUSPENDED, JOB_STATUSES.REJECTED].includes(val), {
      message: `Status must be either '${JOB_STATUSES.SUSPENDED}' or '${JOB_STATUSES.REJECTED}' for moderation`,
    }),
  reviewNote: z
    .string({
      required_error: 'Review note is required for moderation',
    })
    .min(5, 'Review note must be at least 5 characters long')
    .max(500, 'Review note cannot exceed 500 characters'),
});
