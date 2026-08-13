import { z } from 'zod';
import { REPORT_STATUSES } from '../constants/statuses.js';
import mongoose from 'mongoose';

// Validation for GET /api/v1/admin/reports query parameters
export const getReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z
    .string()
    .refine((val) => Object.values(REPORT_STATUSES).includes(val), {
      message: 'Invalid report status',
    })
    .optional(),
});

// Validation for route parameters requiring a valid MongoDB ObjectId
export const reportIdParamSchema = z.object({
  reportId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Report ID format',
  }),
});

// Validation for PATCH /api/v1/admin/reports/:reportId/review
export const reviewReportSchema = z
  .object({
    status: z
      .string()
      .refine((val) => [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.DISMISSED].includes(val), {
        message: `Status must be '${REPORT_STATUSES.RESOLVED}' or '${REPORT_STATUSES.DISMISSED}' for review`,
      }),
    reviewNote: z
      .string({
        required_error: 'Review note is required for report resolution/dismissal',
      })
      .trim()
      .min(10, 'Review note must be at least 10 characters long')
      .max(500, 'Review note cannot exceed 500 characters'),
    jobAction: z.enum(['keep', 'suspend']).optional().default('keep'),
  })
  .refine(
    (data) => {
      if (data.status === REPORT_STATUSES.DISMISSED && data.jobAction === 'suspend') {
        return false;
      }
      return true;
    },
    {
      message: "A dismissed report cannot trigger a job suspension. Set jobAction to 'keep'.",
      path: ['jobAction'], // Error will point to the jobAction field
    }
  );
