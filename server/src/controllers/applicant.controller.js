import { sendSuccess } from '../utils/apiResponse.js';
import {
  listApplicants,
  getApplicantById,
  updateApplicantStatus,
  shortlistApplicant,
  rejectApplicant,
  getApplicantCv,
} from '../services/applicant.service.js';

/**
 * NOTE: reads from req.validatedQuery / req.validatedParams / req.validatedBody
 * instead of the raw req.query / req.params / req.body. This matches the
 * updated shared validate.js middleware (Express 5 compatibility fix —
 * req.query is a getter-only property in Express 5). Falls back to the raw
 * request object only if the validated version isn't present.
 */

/**
 * GET /api/v1/applicants?jobId=&status=&search=&page=&limit=
 */
export async function listApplicantsController(req, res, next) {
  try {
    const query = req.validatedQuery ?? req.query;
    const { applications, pagination } = await listApplicants(query, req.user);
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
 */
export async function getApplicantByIdController(req, res, next) {
  try {
    const { id } = req.validatedParams ?? req.params;
    const { application, jobSeekerProfile } = await getApplicantById(id, req.user);
    return sendSuccess(res, {
      message: 'Applicant retrieved successfully.',
      data: { application, jobSeekerProfile },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/applicants/:id/status
 */
export async function updateApplicantStatusController(req, res, next) {
  try {
    const { id } = req.validatedParams ?? req.params;
    const body = req.validatedBody ?? req.body;
    const { application } = await updateApplicantStatus(id, body, req.user);
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
 */
export async function shortlistApplicantController(req, res, next) {
  try {
    const { id } = req.validatedParams ?? req.params;
    const body = req.validatedBody ?? req.body ?? {};
    const { application } = await shortlistApplicant(id, body, req.user);
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
 */
export async function rejectApplicantController(req, res, next) {
  try {
    const { id } = req.validatedParams ?? req.params;
    const body = req.validatedBody ?? req.body ?? {};
    const { application } = await rejectApplicant(id, body, req.user);
    return sendSuccess(res, {
      message: 'Applicant rejected successfully.',
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/applicants/:id/cv
 */
export async function getApplicantCvController(req, res, next) {
  try {
    const { id } = req.validatedParams ?? req.params;
    const cvData = await getApplicantCv(id, req.user);
    return sendSuccess(res, {
      message: 'Applicant CV download URL generated successfully.',
      data: cvData,
    });
  } catch (error) {
    return next(error);
  }
}
