import { sendSuccess } from '../utils/apiResponse.js';
import {
  createJob,
  listEmployerJobs,
  getJobById,
  updateJob,
} from '../services/job.service.js';

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