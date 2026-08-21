import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Report from '../models/Report.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES, REPORT_STATUSES } from '../constants/statuses.js';

export const createReport = async (reportData) => {
  const { jobId, reason, description, reportedBy } = reportData;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Invalid job ID.');
  }

  const job = await Job.findOne({
    _id: jobId,
    isDeleted: false,
    status: JOB_STATUSES.PUBLISHED,
  }).populate('companyId', 'companyName');

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  const existingReport = await Report.findOne({
  jobId: job._id,
  reportedBy,
  status: {
    $in: [
      REPORT_STATUSES.PENDING,
      REPORT_STATUSES.UNDER_REVIEW,
    ],
  },
});

if (existingReport) {
  throw new ApiError(
    400,
    'You have already reported this job. Please wait until the previous report is reviewed.'
  );
}

try {
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

} catch (error) {

  // Handle MongoDB duplicate key error from unique index
  if (error.code === 11000) {
    throw new ApiError(
      400,
      'You have already reported this job. Please wait until the previous report is reviewed.'
    );
  }

  throw error;
}
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
