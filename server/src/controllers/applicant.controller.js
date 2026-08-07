import { sendSuccess } from '../utils/apiResponse.js';
import {
  listApplicants,
  getApplicantById,
  updateApplicantStatus,
  shortlistApplicant,
  rejectApplicant,
} from '../services/applicant.service.js';

/**
 * GET /api/v1/applicants?jobId=&status=&search=&page=&limit=
 *
 * Lists paginated applicants for a job.
 * req.query has already been parsed and coerced by listApplicantsQuerySchema,
 * so page/limit arrive as integers and jobId is a valid hex string.
 */
export async function listApplicantsController(req, res, next) {
  try {
    const { applications, pagination } = await listApplicants(req.query, req.user);
    return sendSuccess(res, {
      message: 'Applicants retrieved successfully.',
      data: { applications, pagination },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/applicants/:id
 *
 * Returns full details for a single application, including the resume
 * snapshot, statusHistory, and populated jobSeeker (name, email) and job.
 */
export async function getApplicantByIdController(req, res, next) {
  try {
    const { application } = await getApplicantById(req.params.id, req.user);
    return sendSuccess(res, {
      message: 'Applicant retrieved successfully.',
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/applicants/:id/status
 *
 * Updates an application to any employer-settable status.
 * Body: { status, note? } — already validated by updateStatusSchema.
 */
export async function updateApplicantStatusController(req, res, next) {
  try {
    const { application } = await updateApplicantStatus(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      message: `Application status updated to '${application.status}'.`,
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/applicants/:id/shortlist
 *
 * Convenience endpoint — status is hardcoded to SHORTLISTED in the service.
 * Body: { note? } — already validated by shortlistSchema.
 */
export async function shortlistApplicantController(req, res, next) {
  try {
    const { application } = await shortlistApplicant(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      message: 'Applicant shortlisted successfully.',
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/applicants/:id/reject
 *
 * Convenience endpoint — status is hardcoded to REJECTED in the service.
 * Body: { note? } — already validated by rejectSchema.
 */
export async function rejectApplicantController(req, res, next) {
  try {
    const { application } = await rejectApplicant(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      message: 'Applicant rejected successfully.',
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
}
