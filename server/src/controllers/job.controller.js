import { sendSuccess } from '../utils/apiResponse.js';
import {
  listJobs,
  searchJobs,
  filterJobs,
  getJobDetail,
  createJob,
  listEmployerJobs,
  getJobById,
  updateJob,
  deleteJob,
  submitJobForReview,
  closeJob,
  reopenJob,
} from '../services/job.service.js';

/**
 * GET /jobs — list published jobs (paginated).
 */
export async function list(req, res, next) {
  try {
    const result = await listJobs(req.validatedQuery);
    return sendSuccess(res, {
      message: 'Jobs retrieved.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /jobs — create a new job posting as a draft.
 * companyId is derived server-side from the authenticated employer.
 */
export async function createJobController(req, res, next) {
  try {
    const job = await createJob({
      employerId: req.user._id,
      payload: req.body,
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Job created as draft.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /jobs/search — keyword + location search.
 */
export async function search(req, res, next) {
  try {
    const result = await searchJobs(req.validatedQuery);
    return sendSuccess(res, {
      message: 'Search results retrieved.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /employer/jobs — list all jobs owned by the authenticated employer.
 */
export async function listEmployerJobsController(req, res, next) {
  try {
    const jobs = await listEmployerJobs({ employerId: req.user._id });
    return sendSuccess(res, {
      message: 'Employer jobs retrieved.',
      data: { jobs },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /jobs/filter — structured filtering.
 */
export async function filter(req, res, next) {
  try {
    const result = await filterJobs(req.validatedQuery);
    return sendSuccess(res, {
      message: 'Filtered jobs retrieved.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /jobs/:id — job detail + similar jobs.
 */
export async function detail(req, res, next) {
  try {
    const result = await getJobDetail(req.validatedParams.id);
    return sendSuccess(res, {
      message: 'Job retrieved.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /jobs/:jobId — get a single job owned by the authenticated employer.
 */
export async function getJobController(req, res, next) {
  try {
    const job = await getJobById({
      jobId: req.params.jobId,
      employerId: req.user._id,
    });
    return sendSuccess(res, {
      message: 'Job retrieved.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /jobs/:jobId — edit a job owned by the authenticated employer.
 */
export async function updateJobController(req, res, next) {
  try {
    const job = await updateJob({
      jobId: req.params.jobId,
      employerId: req.user._id,
      updates: req.body,
    });
    return sendSuccess(res, {
      message: 'Job updated.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /jobs/:jobId — soft delete a job owned by the authenticated employer.
 * Allowed only from draft, closed, or rejected statuses.
 */
export async function deleteJobController(req, res, next) {
  try {
    const job = await deleteJob({
      jobId: req.params.jobId,
      employerId: req.user._id,
    });
    return sendSuccess(res, {
      message: 'Job deleted.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /jobs/:jobId/submit-for-review — draft/rejected → pending_review.
 * Clears any previous review feedback on resubmission.
 */
export async function submitJobForReviewController(req, res, next) {
  try {
    const job = await submitJobForReview({
      jobId: req.params.jobId,
      employerId: req.user._id,
    });
    return sendSuccess(res, {
      message: 'Job submitted for review.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /jobs/:jobId/close — published → closed.
 */
export async function closeJobController(req, res, next) {
  try {
    const job = await closeJob({
      jobId: req.params.jobId,
      employerId: req.user._id,
      reason: req.body.reason,
    });
    return sendSuccess(res, {
      message: 'Job closed.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /jobs/:jobId/reopen — closed → published.
 * Requires a new deadline if the posting has already expired.
 */
export async function reopenJobController(req, res, next) {
  try {
    const job = await reopenJob({
      jobId: req.params.jobId,
      employerId: req.user._id,
      newDeadline: req.body.deadline,
    });
    return sendSuccess(res, {
      message: 'Job reopened.',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}
