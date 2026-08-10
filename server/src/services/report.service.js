import Report from '../models/Report.js';
import mongoose from 'mongoose';

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

export const getReportById = async (reportId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return null;
  }

  const report = await Report.findOne({
    _id: reportId,
    reportedBy: userId,
  });

  return report;
};