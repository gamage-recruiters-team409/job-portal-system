import * as adminJobService from '../services/adminJob.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getJobs(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;

    const result = await adminJobService.getJobs({
      search,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Jobs retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobById(req, res, next) {
  try {
    const { jobId } = req.params;

    const job = await adminJobService.getJobById(jobId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Job retrieved successfully',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
}

export async function moderateJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { status, reviewNote } = req.body;
    const adminUserId = req.user.id;

    const job = await adminJobService.moderateJob(jobId, adminUserId, status, reviewNote);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Job status moderated successfully',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
}
