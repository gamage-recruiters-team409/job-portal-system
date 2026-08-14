import * as adminReportService from '../services/adminReport.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getReports(req, res, next) {
  try {
    const { page, limit, search, status } = req.validatedQuery || req.query;

    const result = await adminReportService.getReports({ search, status, page, limit });

    return sendSuccess(res, {
      message: 'Reports retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportById(req, res, next) {
  try {
    const { reportId } = req.validatedParams || req.params;

    const report = await adminReportService.getReportById(reportId);

    return sendSuccess(res, {
      message: 'Report retrieved successfully',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
}

export async function reviewReport(req, res, next) {
  try {
    const { reportId } = req.validatedParams || req.params;
    const { status, reviewNote, jobAction } = req.validatedBody || req.body;
    const adminUserId = req.user.id;

    const { report, updatedJob } = await adminReportService.reviewReport(
      reportId,
      adminUserId,
      status,
      reviewNote,
      jobAction
    );

    return sendSuccess(res, {
      message: 'Report reviewed successfully',
      data: { report, updatedJob },
    });
  } catch (error) {
    return next(error);
  }
}
