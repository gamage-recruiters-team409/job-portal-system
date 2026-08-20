import * as adminJobService from '../services/adminJob.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getJobs(req, res, next) {
  try {
    const { page, limit, search, status } = req.validatedQuery || req.query;

    const result = await adminJobService.getJobs({ search, status, page, limit });

    return sendSuccess(res, {
      message: 'Jobs retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getJobById(req, res, next) {
  try {
    const { jobId } = req.validatedParams || req.params;

    const job = await adminJobService.getJobById(jobId);

    return sendSuccess(res, {
      message: 'Job retrieved successfully',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

export async function moderateJob(req, res, next) {
  try {
    const { jobId } = req.validatedParams || req.params;
    const { status, reviewNote } = req.validatedBody || req.body;
    const adminUserId = req.user.id;

    const job = await adminJobService.moderateJob(jobId, adminUserId, status, reviewNote);

    return sendSuccess(res, {
      message: 'Job status moderated successfully',
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getJobStats(req, res, next) {
  try {
    const stats = await adminJobService.getJobStats();

    return sendSuccess(res, {
      message: 'Job statistics retrieved successfully',
      data: { stats },
    });
  } catch (error) {
    return next(error);
  }
}
