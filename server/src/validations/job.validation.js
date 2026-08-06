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
