import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/company.model.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import {
  JOB_STATUSES,
  APPLICATION_STATUSES,
  USER_ROLES,
  EMPLOYER_VERIFICATION_STATUSES,
} from '../constants/statuses.js';

/**
 * Returns job and application counts for the logged-in employer's company.
 */
export async function getEmployerStatistics(employerUserId) {
  const company = await Company.findOne({ employerUserId });

  if (!company) {
    throw new ApiError(404, 'Company profile not found for this employer.');
  }

  const [totalJobPosts, activeJobs, closedJobs, jobIds] = await Promise.all([
    Job.countDocuments({ companyId: company._id, isDeleted: false }),
    Job.countDocuments({
      companyId: company._id,
      isDeleted: false,
      status: JOB_STATUSES.PUBLISHED,
    }),
    Job.countDocuments({
      companyId: company._id,
      isDeleted: false,
      status: JOB_STATUSES.CLOSED,
    }),
    Job.find({ companyId: company._id, isDeleted: false }).select('_id'),
  ]);

  const totalApplicationsReceived = await Application.countDocuments({
    job: { $in: jobIds.map((j) => j._id) },
  });

  return {
    totalJobPosts,
    activeJobs,
    closedJobs,
    totalApplicationsReceived,
  };
}

/**
 * Returns application and saved-job counts for the logged-in job seeker.
 */
export async function getJobSeekerStatistics(jobSeekerId) {
  const [totalApplications, savedJobs, underReview, shortlisted] = await Promise.all([
    Application.countDocuments({ jobSeeker: jobSeekerId }),
    SavedJob.countDocuments({ jobSeeker: jobSeekerId }),
    Application.countDocuments({
      jobSeeker: jobSeekerId,
      status: APPLICATION_STATUSES.UNDER_REVIEW,
    }),
    Application.countDocuments({
      jobSeeker: jobSeekerId,
      status: APPLICATION_STATUSES.SHORTLISTED,
    }),
  ]);

  return {
    totalApplications,
    savedJobs,
    underReview,
    shortlisted,
  };
}

/**
 * Returns platform-wide counts for the admin dashboard.
 * Note: "pending reports" is not yet included — the Report model
 * (owned by Anuruddhika) does not exist in develop yet. Will be added
 * once that model is merged.
 */
export async function getAdminStatistics() {
  const [totalUsers, totalEmployers, verifiedEmployers, publishedJobs] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: USER_ROLES.EMPLOYER }),
    Company.countDocuments({ verificationStatus: EMPLOYER_VERIFICATION_STATUSES.VERIFIED }),
    Job.countDocuments({ status: JOB_STATUSES.PUBLISHED, isDeleted: false }),
  ]);

  return {
    totalUsers,
    totalEmployers,
    verifiedEmployers,
    publishedJobs,
    // pendingReports intentionally omitted — Report model not yet available
  };
}
