import { z } from 'zod';
import { JOB_TYPES, WORK_MODES } from '../constants/jobOptions.js';

/**
 * Shared preprocessors for optional query params.
 * Query strings arrive as text, so empty values and null are treated as absent.
 */
const optionalString = (schema) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    schema.optional()
  );

const optionalNumber = (schema = z.number()) =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? val : num;
  }, schema.optional());

/**
 * Pagination — `page` and `limit` are positive ints with sensible caps.
 */
export const paginationSchema = z.object({
  page: optionalNumber(z.number().int().min(1)).default(1),
  limit: optionalNumber(z.number().int().min(1).max(50)).default(12),
});

/**
 * GET /jobs — list published jobs (paginated).
 */
export const listJobsSchema = paginationSchema;

/**
 * GET /jobs/search — full-text style keyword + location.
 */
export const searchJobsSchema = paginationSchema.extend({
  q: optionalString(z.string().trim().min(1).max(100)),
  location: optionalString(z.string().trim().min(1).max(100)),
});

/**
 * GET /jobs/filter — structured filtering.
 * Optional params mirror the Job model fields. Passing none returns published jobs.
 */
export const filterJobsSchema = paginationSchema
  .extend({
    category: optionalString(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id')),
    jobType: optionalString(z.enum(Object.values(JOB_TYPES))),
    workMode: optionalString(z.enum(Object.values(WORK_MODES))),
    minExperience: optionalNumber(z.number().int().nonnegative()),
    maxExperience: optionalNumber(z.number().int().nonnegative()),
    minSalary: optionalNumber(z.number().int().nonnegative()),
    maxSalary: optionalNumber(z.number().int().nonnegative()),
    // "today" | "week" | "month" | "any" (default) — window for posted_date
    postedDate: optionalString(z.enum(['today', 'week', 'month'])),
  })
  .refine(
    (data) => {
      if (data.minExperience != null && data.maxExperience != null) {
        return data.minExperience <= data.maxExperience;
      }
      return true;
    },
    {
      path: ['maxExperience'],
      message: 'maxExperience cannot be less than minExperience',
    }
  )
  .refine(
    (data) => {
      if (data.minSalary != null && data.maxSalary != null) {
        return data.minSalary <= data.maxSalary;
      }
      return true;
    },
    {
      path: ['maxSalary'],
      message: 'maxSalary cannot be less than minSalary',
    }
  );

/**
 * GET /jobs/:id — no query validation; the id is validated in the route/controller.
 */
export const jobIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job id'),
});

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
    .refine(
      (skills) => {
        if (!skills) return true;
        const normalized = skills.map((id) => id.toLowerCase());
        return new Set(normalized).size === normalized.length;
      },
      { message: 'Duplicate skill IDs are not allowed.' }
    ),
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

export const closeJobSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const reopenJobSchema = z.object({
  deadline: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: 'Deadline must be a future date.',
    })
    .optional(),
});
