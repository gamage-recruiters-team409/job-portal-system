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
