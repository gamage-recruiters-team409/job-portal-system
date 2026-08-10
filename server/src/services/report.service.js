import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Report from '../models/Report.js';

export const createReport = async (reportData) => {
  const { jobId, reason, description, reportedBy } = reportData;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid job ID');
  }

  const job = await Job.findOne({
    _id: jobId,
    isDeleted: false,
  }).populate('companyId', 'companyName');

  if (!job) {
    throw new Error('Job not found');
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