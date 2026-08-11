import { z } from 'zod';
import { APPLICATION_STATUSES } from '../constants/statuses.js';

/**
 * Zod 4 note (see auth.validation.js): type-level error messages use
 * `{ error: '...' }`; chained validator messages use a plain string.
 *
 * Employer-settable statuses are a strict subset of APPLICATION_STATUSES.
 * APPLIED and WITHDRAWN can never be set by an employer action:
 *   - APPLIED    → set only when a job seeker submits an application.
 *   - WITHDRAWN  → set only when a job seeker withdraws (separate flow).
 * These two are therefore excluded from updateStatusSchema.
 */
const EMPLOYER_SETTABLE_STATUSES = [
  APPLICATION_STATUSES.UNDER_REVIEW,
  APPLICATION_STATUSES.SHORTLISTED,
  APPLICATION_STATUSES.SELECTED,
  APPLICATION_STATUSES.REJECTED,
];

// ---------------------------------------------------------------------------
// GET /api/v1/applicants — query parameters
// ---------------------------------------------------------------------------

/**
 * Validates the query string for the "list applicants" endpoint.
 *
 * - jobId   : required; must be a 24-char hex string (MongoDB ObjectId format).
 * - status  : optional; must be one of the full APPLICATION_STATUSES values
 *             (an employer may filter by any status, including applied/withdrawn).
 * - search  : optional; free-text match against applicant name or email.
 * - page    : optional; coerced to integer, minimum 1, defaults to 1.
 * - limit   : optional; coerced to integer, 1–100, defaults to 10.
 *
 * `z.coerce` is used for page/limit because Express delivers all query params
 * as strings — coerce converts "2" → 2 before downstream validation fires.
 */
export const listApplicantsQuerySchema = z.object({
  jobId: z
    .string({ error: 'jobId is required' })
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'jobId must be a valid MongoDB ObjectId'),

  status: z
    .enum(Object.values(APPLICATION_STATUSES), {
      error: `status must be one of: ${Object.values(APPLICATION_STATUSES).join(', ')}`,
    })
    .optional(),

  search: z.string().trim().max(100, 'search cannot exceed 100 characters').optional(),

  page: z.coerce
    .number({ error: 'page must be a number' })
    .int('page must be an integer')
    .min(1, 'page must be at least 1')
    .default(1),

  limit: z.coerce
    .number({ error: 'limit must be a number' })
    .int('limit must be an integer')
    .min(1, 'limit must be at least 1')
    .max(100, 'limit cannot exceed 100')
    .default(10),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/applicants/:id/status — body
// ---------------------------------------------------------------------------

/**
 * Validates the body for the generic status-update endpoint.
 *
 * - status : required; restricted to the four employer-settable values.
 *            APPLIED and WITHDRAWN are intentionally excluded (see above).
 * - note   : optional; stored as employerNote on the Application document.
 *            Max 1000 chars matches the employerNote maxlength in Application.js.
 */
export const updateStatusSchema = z.object({
  status: z.enum(EMPLOYER_SETTABLE_STATUSES, {
    error: `status must be one of: ${EMPLOYER_SETTABLE_STATUSES.join(', ')}`,
  }),

  note: z.string().trim().max(1000, 'note cannot exceed 1000 characters').optional(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/applicants/:id/shortlist — body
// PATCH /api/v1/applicants/:id/reject    — body
// ---------------------------------------------------------------------------

/**
 * Validates the optional body for the shortlist and reject convenience
 * endpoints. The target status is hardcoded in the service layer for these
 * routes — the client only supplies an optional note.
 */
const noteOnlySchema = z.object({
  note: z.string().trim().max(1000, 'note cannot exceed 1000 characters').optional(),
});

export const shortlistSchema = noteOnlySchema;
export const rejectSchema = noteOnlySchema;

// ---------------------------------------------------------------------------
// Route param — :id
// ---------------------------------------------------------------------------

/**
 * Validates req.params.id for every route that uses an Application ObjectId.
 * Applied via validate(applicantIdParamSchema, 'params') so a malformed :id
 * returns a clean 400 instead of a Mongoose CastError from the service layer.
 */
export const applicantIdParamSchema = z.object({
  id: z
    .string({ error: 'Application id is required' })
    .regex(/^[a-f\d]{24}$/i, 'Application id must be a valid MongoDB ObjectId'),
});
