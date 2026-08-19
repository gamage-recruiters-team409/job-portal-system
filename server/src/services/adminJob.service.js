import Job from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get paginated, searchable, filterable list of jobs for Admin.
 */
export async function getJobs({ search, status, page = 1, limit = 10 }) {
  // Base filter: exclude soft-deleted jobs by default
  const filter = { isDeleted: false };

  // Search by title (case-insensitive, regex-safe)
  if (search) {
    const escaped = escapeRegex(search);
    filter.title = { $regex: escaped, $options: 'i' };
  }

  // Filter by job status
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('companyId', 'companyName companyLogo verificationStatus')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single job by ID for Admin view.
 */
export async function getJobById(jobId) {
  const job = await Job.findById(jobId)
    .populate('companyId', 'companyName companyLogo verificationStatus industry companyLocation')
    .populate('createdBy', 'name email')
    .populate('category', 'name')
    .populate('skills', 'skillName');

  if (!job || job.isDeleted) {
    throw new ApiError(404, 'Job not found.');
  }

  return job;
}

/**
 * Valid Admin status transitions.
 * Key = current status, Value = array of allowed target statuses.
 */
const VALID_ADMIN_TRANSITIONS = Object.freeze({
  [JOB_STATUSES.PENDING_REVIEW]: [JOB_STATUSES.PUBLISHED, JOB_STATUSES.REJECTED],
  [JOB_STATUSES.PUBLISHED]: [JOB_STATUSES.SUSPENDED],
});

/**
 * Admin changes a job's status (publish / suspend / reject) with a mandatory review note.
 * Enforces valid source → target status transitions.
 */
export async function moderateJob(jobId, adminUserId, status, reviewNote) {
  const job = await Job.findById(jobId);

  if (!job || job.isDeleted) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.status === status) {
    throw new ApiError(400, `Job is already ${status}.`);
  }

  // Enforce valid status transitions
  const allowedTargets = VALID_ADMIN_TRANSITIONS[job.status];
  if (!allowedTargets || !allowedTargets.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition: cannot change from '${job.status}' to '${status}'.`
    );
  }

  // Prevent publishing jobs with expired deadlines
  if (status === JOB_STATUSES.PUBLISHED && job.deadline && new Date(job.deadline) < new Date()) {
    throw new ApiError(400, 'Cannot publish a job with an expired deadline.');
  }

  job.status = status;
  job.reviewedBy = adminUserId;
  job.reviewedAt = new Date();
  job.reviewNote = reviewNote;

  job.statusHistory.push({
    status: status,
    changedBy: adminUserId,
    note: reviewNote,
  });

  await job.save();
  return job;
}
