import Report from '../models/Report.js';
import { ApiError } from '../utils/apiError.js';
import { REPORT_STATUSES, JOB_STATUSES } from '../constants/statuses.js';
import { moderateJob } from './adminJob.service.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get paginated, searchable, filterable list of reports for Admin.
 */
export async function getReports({ search, status, page = 1, limit = 10 }) {
  const filter = {};

  // Search by job title or company name (case-insensitive, regex-safe)
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { jobTitle: { $regex: escaped, $options: 'i' } },
      { companyName: { $regex: escaped, $options: 'i' } }
    ];
  }

  // Filter by report status
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('jobId', 'title status isDeleted')
      .populate('companyId', 'companyName companyLogo verificationStatus')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single report by ID for Admin view.
 */
export async function getReportById(reportId) {
  const report = await Report.findById(reportId)
    .populate(
      'jobId',
      'title status isDeleted description responsibilities requirements ' +
        'benefits location jobType workMode salaryMin salaryMax ' +
        'salaryCurrency experienceYears deadline'
    )
    .populate('companyId', 'companyName companyLogo verificationStatus')
    .populate('reportedBy', 'name email')
    .populate('reviewedBy', 'name email');

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
}

/**
 * Valid Admin report status transitions.
 * Key = current status, Value = array of allowed target statuses.
 */
const VALID_ADMIN_REPORT_TRANSITIONS = Object.freeze({
  [REPORT_STATUSES.PENDING]: [
    REPORT_STATUSES.RESOLVED,
    REPORT_STATUSES.DISMISSED,
    REPORT_STATUSES.UNDER_REVIEW,
  ],
  [REPORT_STATUSES.UNDER_REVIEW]: [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.DISMISSED],
});

/**
 * Admin reviews a report (resolve/dismiss) with a mandatory review note,
 * and optionally takes action on the reported job (e.g. suspend).
 */
export async function reviewReport(reportId, adminUserId, status, reviewNote, jobAction = 'keep') {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  if (report.status === status) {
    throw new ApiError(400, `Report is already ${status}.`);
  }

  // Enforce valid status transitions
  const allowedTargets = VALID_ADMIN_REPORT_TRANSITIONS[report.status];
  if (!allowedTargets || !allowedTargets.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition: cannot change from '${report.status}' to '${status}'.`
    );
  }

  // Update report
  report.status = status;
  report.reviewedBy = adminUserId;
  report.reviewedAt = new Date();
  report.reviewNote = reviewNote;

  let updatedJob = null;

  if (jobAction === 'suspend') {
    // Reuse existing Admin Job lifecycle rules to prevent suspending deleted/closed/draft jobs
    updatedJob = await moderateJob(report.jobId, adminUserId, JOB_STATUSES.SUSPENDED, reviewNote);
  }

  await report.save();

  return { report, updatedJob };
}
