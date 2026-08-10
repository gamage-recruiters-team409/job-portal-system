import {
  createReport,
  getMyReports,
  getReportById,
} from '../services/report.service.js';

export const createReportController = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      reportedBy: req.user._id,
    };

    const report = await createReport(reportData);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReportsController = async (req, res) => {
  try {
    const reports = await getMyReports(req.user._id);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReportByIdController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};