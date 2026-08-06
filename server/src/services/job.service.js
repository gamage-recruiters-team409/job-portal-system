import Job from '../models/Job.js';
// Importing the model registers its schema with Mongoose, which is required
// for `populate` to resolve the ref. The Company model is otherwise only
// loaded by the company routes, so without this import populate throws
// 'Schema hasn't been registered for model "Company"'.
import '../models/company.model.js';
import { JOB_STATUSES } from '../constants/statuses.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Explicit public field projection for the Job model.
 * Excludes internal, moderation, status-history, and deletion metadata.
 */
const PUBLIC_JOB_PROJECTION = [
  'title',
  'description',
  'responsibilities',
  'requirements',
  'benefits',
  'category',
  'skills',
  'location',
  'jobType',
  'workMode',
  'experienceYears',
  'salaryCurrency',
  'salaryMin',
  'salaryMax',
  'deadline',
  'companyId',
  'viewsCount',
  'createdAt',
  'updatedAt',
].join(' ');

/**
 * Approved Company fields to populate for public job cards.
 */
const COMPANY_POPULATION = {
  path: 'companyId',
  select: 'companyName companyLogo companyLocation',
};

/**
 * Base query used by every public jobs endpoint.
 * Only published, non-deleted jobs are ever exposed to the public.
 */
function publicBaseFilter() {
  return {
    status: JOB_STATUSES.PUBLISHED,
    isDeleted: false,
  };
}

/** Escapes special regex characters in user-provided query strings. */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a case-insensitive regex keyword filter.
 */
function keywordFilter(q) {
  if (!q) return {};
  const escaped = escapeRegExp(q);
  return {
    $or: [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ],
  };
}

/**
 * Apply pagination, selection, and population.
 */
async function paginate(query, page, limit) {
  const [docs, total] = await Promise.all([
    query
      .select(PUBLIC_JOB_PROJECTION)
      .populate(COMPANY_POPULATION)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(query.getFilter()),
  ]);
  return {
    jobs: docs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * GET /jobs — list published jobs (paginated, newest first).
 */
export async function listJobs({ page = 1, limit = 12 } = {}) {
  const query = Job.find(publicBaseFilter());
  return paginate(query, page, limit);
}

/**
 * GET /jobs/search — keyword + location search over published jobs.
 */
export async function searchJobs({ q, location, page = 1, limit = 12 } = {}) {
  const filter = { ...publicBaseFilter() };
  if (q) Object.assign(filter, keywordFilter(q));
  if (location) {
    filter.location = { $regex: escapeRegExp(location), $options: 'i' };
  }
  return paginate(Job.find(filter), page, limit);
}

/**
 * GET /jobs/filter — structured filter over published jobs.
 * Filters are combined with AND; any number may be omitted.
 */
export async function filterJobs(filters = {}) {
  const filter = { ...publicBaseFilter() };
  const {
    page = 1,
    limit = 12,
    category,
    jobType,
    workMode,
    minExperience,
    maxExperience,
    minSalary,
    maxSalary,
    postedDate,
  } = filters;

  if (category) filter.category = category;
  if (jobType) filter.jobType = jobType;
  if (workMode) filter.workMode = workMode;

  if (minExperience != null || maxExperience != null) {
    filter.experienceYears = {};
    if (minExperience != null) filter.experienceYears.$gte = minExperience;
    if (maxExperience != null) filter.experienceYears.$lte = maxExperience;
  }

  if (minSalary != null || maxSalary != null) {
    // A job matches when its salary band overlaps the requested range.
    // Missing salary bounds are treated as unbounded.
    const band = { $or: [] };
    if (minSalary != null) {
      // job.salaryMax is null (unbounded) or >= requested minimum
      band.$or.push({ salaryMax: { $gte: minSalary } }, { salaryMax: null });
    }
    if (maxSalary != null) {
      // job.salaryMin is null (unbounded) or <= requested maximum
      band.$or.push({ salaryMin: { $lte: maxSalary } }, { salaryMin: null });
    }
    // If both bounds given, a match needs to satisfy both sides.
    if (minSalary != null && maxSalary != null) {
      filter.$and = [
        { $or: [{ salaryMax: { $gte: minSalary } }, { salaryMax: null }] },
        { $or: [{ salaryMin: { $lte: maxSalary } }, { salaryMin: null }] },
      ];
    } else {
      filter.$or = band.$or;
    }
  }

  if (postedDate) {
    const days = { today: 1, week: 7, month: 30 }[postedDate];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: since };
  }

  return paginate(Job.find(filter), page, limit);
}

/**
 * GET /jobs/:id — job detail. Uses `populate` for company; category/skills are
 * left as raw ids because the Category/Skill models are not yet registered on
 * the shared codebase. Also returns up to 4 similar jobs
 * matched on category and jobType.
 */
export async function getJobDetail(id) {
  const job = await Job.findOne({ _id: id, ...publicBaseFilter() })
    .select(PUBLIC_JOB_PROJECTION)
    .populate(COMPANY_POPULATION)
    .lean();
  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  const similar = await Job.find({
    _id: { $ne: id },
    category: job.category,
    jobType: job.jobType,
    status: JOB_STATUSES.PUBLISHED,
    isDeleted: false,
  })
    .select(PUBLIC_JOB_PROJECTION)
    .populate(COMPANY_POPULATION)
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  return { job, similar };
}
