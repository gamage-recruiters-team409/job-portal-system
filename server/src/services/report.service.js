import Report from '../models/Report.js';

export const createReport = async (reportData) => {
  const report = await Report.create(reportData);

  return report;
};

export const getMyReports = async (userId) => {
  const reports = await Report.find({
    reportedBy: userId,
  }).sort({
    createdAt: -1,
  });

  return reports;
};

export const getReportById = async (reportId) => {
  const report = await Report.findById(reportId);

  return report;
};