import {
  createReport,
  getMyReports,
  getReportById,
} from '../services/report.service.js';

export const createReportController = async (req, res, next) => {
  try {
    const reportData = {
      jobId: req.body.jobId,
      reason: req.body.reason,
      description: req.body.description,
      reportedBy: req.user._id,
    };

    const report = await createReport(reportData);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReportsController = async (req, res, next) => {
  try {
    const reports = await getMyReports(req.user._id);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportByIdController = async (req, res, next) => {
  try {
    const report = await getReportById(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};