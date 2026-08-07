import Job from '../models/Job.js';
import Company from '../models/company.model.js';
import { JOB_STATUSES } from '../constants/statuses.js';
import { ApiError } from '../utils/apiError.js';

const EDITABLE_STATUSES = [JOB_STATUSES.DRAFT, JOB_STATUSES.REJECTED];

async function getOwnedCompany(employerId) {
  const company = await Company.findOne({ employerUserId: employerId });

  if (!company) {
    throw new ApiError(
      404,
      'Company profile not found for this employer. Create a company profile first.'
    );
  }

  return company;
}

export async function createJob({ employerId, payload }) {
  const company = await getOwnedCompany(employerId);

  const job = await Job.create({
    ...payload,
    companyId: company._id,
    createdBy: employerId,
    status: JOB_STATUSES.DRAFT,
    statusHistory: [
      {
        status: JOB_STATUSES.DRAFT,
        changedBy: employerId,
      },
    ],
  });

  return job;
}

export async function listEmployerJobs({ employerId }) {
  const jobs = await Job.find({
    createdBy: employerId,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return jobs;
}

export async function getJobById({ jobId, employerId }) {
  const job = await Job.findOne({
    _id: jobId,
    createdBy: employerId,
    isDeleted: false,
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  return job;
}

export async function updateJob({ jobId, employerId, updates }) {
  const job = await Job.findOne({
    _id: jobId,
    createdBy: employerId,
    isDeleted: false,
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (!EDITABLE_STATUSES.includes(job.status)) {
    throw new ApiError(
      400,
      `Job content cannot be edited while status is "${job.status}". Only draft or rejected jobs can be edited directly.`
    );
  }

  const effectiveSalaryMin = updates.salaryMin !== undefined ? updates.salaryMin : job.salaryMin;
  const effectiveSalaryMax = updates.salaryMax !== undefined ? updates.salaryMax : job.salaryMax;

  if (
    effectiveSalaryMin != null &&
    effectiveSalaryMax != null &&
    effectiveSalaryMax < effectiveSalaryMin
  ) {
    throw new ApiError(400, 'salaryMax cannot be lower than salaryMin.');
  }

  Object.assign(job, updates);
  await job.save();

  return job;
}

export async function submitJobForReview({ jobId, employerId }) {
  const job = await Job.findOne({ _id: jobId, createdBy: employerId, isDeleted: false });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (![JOB_STATUSES.DRAFT, JOB_STATUSES.REJECTED].includes(job.status)) {
    throw new ApiError(400, `Cannot submit for review from status "${job.status}".`);
  }

  job.status = JOB_STATUSES.PENDING_REVIEW;
  job.reviewNote = undefined;
  job.reviewedBy = undefined;
  job.reviewedAt = undefined;
  job.statusHistory.push({ status: JOB_STATUSES.PENDING_REVIEW, changedBy: employerId });

  await job.save();
  return job;
}

export async function closeJob({ jobId, employerId, reason }) {
  const job = await Job.findOne({ _id: jobId, createdBy: employerId, isDeleted: false });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.status !== JOB_STATUSES.PUBLISHED) {
    throw new ApiError(400, `Cannot close a job with status "${job.status}".`);
  }

  job.status = JOB_STATUSES.CLOSED;
  job.statusHistory.push({ status: JOB_STATUSES.CLOSED, changedBy: employerId, note: reason });

  await job.save();
  return job;
}

export async function reopenJob({ jobId, employerId, newDeadline }) {
  const job = await Job.findOne({ _id: jobId, createdBy: employerId, isDeleted: false });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.status !== JOB_STATUSES.CLOSED) {
    throw new ApiError(400, `Cannot reopen a job with status "${job.status}".`);
  }

  const isExpired = job.deadline < new Date();

  if (isExpired && !newDeadline) {
    throw new ApiError(400, 'This posting has expired. A new deadline is required to reopen it.');
  }

  if (newDeadline) {
    job.deadline = newDeadline;
  }

  job.status = JOB_STATUSES.PUBLISHED;
  job.statusHistory.push({ status: JOB_STATUSES.PUBLISHED, changedBy: employerId });

  await job.save();
  return job;
}