import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';

export const createReport = async (reportData) => {
  const { jobId, reason, description, reportedBy } = reportData;

  // Validate Job ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    const error = new Error('Invalid Job ID');
    error.statusCode = 400;
    throw error;
  }

  // Get the job from the database
  const job = await Job.findOne({
    _id: jobId,
    isDeleted: false,
  });

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  // Derive company information from the shared Job data
  const company = await Company.findById(job.companyId);

  const report = await Report.create({
    jobId: job._id,
    jobTitle: job.title,
    companyId: job.companyId,
    companyName: company?.companyName,
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