import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Report from '../models/Report.js';
import { ApiError } from '../utils/apiError.js';

export const createReport = async (reportData) => {
  const { jobId, reason, description, reportedBy } = reportData;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Invalid job ID.');
  }

  const job = await Job.findOne({
    _id: jobId,
    isDeleted: false,
  }).populate('companyId', 'companyName');

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  const report = await Report.create({
    jobId: job._id,
    jobTitle: job.title,
    companyId: job.companyId?._id,
    companyName: job.companyId?.companyName,
    reportedBy,
    reason,
    description,
  });

  return report;
};

export const getMyReports = async (userId) => {
  return await Report.find({
    reportedBy: userId,
  }).sort({
    createdAt: -1,
  });
};

export const getReportById = async (reportId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, 'Invalid report ID.');
  }

  const report = await Report.findOne({
    _id: reportId,
    reportedBy: userId,
  });

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};