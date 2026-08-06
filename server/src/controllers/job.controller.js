import { sendSuccess } from '../utils/apiResponse.js';
import { listJobs, searchJobs, filterJobs, getJobDetail } from '../services/job.service.js';

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
