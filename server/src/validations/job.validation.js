import { z } from 'zod';
import { JOB_TYPES, WORK_MODES } from '../constants/jobOptions.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectId = z.string().regex(objectIdRegex, 'Invalid ID format.');

const salaryRangeRefinement = (data) =>
  data.salaryMax == null || data.salaryMin == null || data.salaryMax >= data.salaryMin;

const jobBaseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  responsibilities: z.string().trim().min(1, 'Responsibilities are required.'),
  requirements: z.string().trim().min(1, 'Requirements are required.'),
  benefits: z.string().trim().optional(),

  category: objectId,
  skills: z
    .array(objectId)
    .optional()
    .refine((skills) => !skills || new Set(skills).size === skills.length, {
      message: 'Duplicate skill IDs are not allowed.',
    }),

  location: z.string().trim().min(1, 'Location is required.'),
  jobType: z.enum(Object.values(JOB_TYPES)),
  workMode: z.enum(Object.values(WORK_MODES)),
  experienceYears: z.number().min(0),

  salaryCurrency: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),

  deadline: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Deadline must be a future date.',
  }),
});

export const createJobSchema = jobBaseSchema.refine(salaryRangeRefinement, {
  message: 'salaryMax cannot be lower than salaryMin.',
  path: ['salaryMax'],
});

export const updateJobSchema = jobBaseSchema
  .partial()
  .refine(salaryRangeRefinement, {
    message: 'salaryMax cannot be lower than salaryMin.',
    path: ['salaryMax'],
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty.',
  });

export const jobIdParamSchema = z.object({
  jobId: objectId,
});
