import Job from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';

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
    .populate('skills', 'name');

  if (!job || job.isDeleted) {
    throw new ApiError(404, 'Job not found.');
  }

  return job;
}

/**
 * Admin changes a job's status (suspend / reject) with a mandatory review note.
 */
export async function moderateJob(jobId, adminUserId, status, reviewNote) {
  const job = await Job.findById(jobId);

  if (!job || job.isDeleted) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.status === status) {
    throw new ApiError(400, `Job is already ${status}.`);
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
