import { z } from 'zod';


export const createReportSchema = z.object({
  jobId: z.string()
    .min(1, 'Job ID is required'),

  jobTitle: z.string()
    .min(1, 'Job title is required'),

  companyName: z.string()
    .optional(),

  reason: z.string()
    .min(1, 'Reason is required'),

  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});


export const updateReportStatusSchema = z.object({
  status: z.enum([
    'pending',
    'under_review',
    'resolved',
    'dismissed',
  ]),
});