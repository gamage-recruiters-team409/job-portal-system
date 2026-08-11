import { sendSuccess } from '../utils/apiResponse.js';
import {
  getEmployerStatistics,
  getJobSeekerStatistics,
  getAdminStatistics,
} from '../services/statistics.service.js';

/**
 * GET /statistics/employer — return job/application counts for the
 * logged-in employer's own company.
 */
export async function employerStatistics(req, res, next) {
  try {
    const stats = await getEmployerStatistics(req.user._id);
    return sendSuccess(res, {
      message: 'Employer statistics retrieved.',
      data: { statistics: stats },
    });
  } catch (error) {
    return next(error);
  }
}

export async function jobSeekerStatistics(req, res, next) {
  try {
    const stats = await getJobSeekerStatistics(req.user._id);
    return sendSuccess(res, {
      message: 'Job seeker statistics retrieved.',
      data: { statistics: stats },
    });
  } catch (error) {
    return next(error);
  }
}

export async function adminStatistics(req, res, next) {
  try {
    const stats = await getAdminStatistics();
    return sendSuccess(res, {
      message: 'Admin statistics retrieved.',
      data: { statistics: stats },
    });
  } catch (error) {
    return next(error);
  }
}
