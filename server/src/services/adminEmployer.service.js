import Company from '../models/company.model.js';
import { ApiError } from '../utils/apiError.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get paginated, searchable, filterable list of employers (companies) for Admin.
 */
export async function getEmployers({ search, status, page = 1, limit = 10 }) {
  const filter = {};

  // Search by company name (case-insensitive)
  if (search) {
    const escaped = escapeRegex(search);
    filter.companyName = { $regex: escaped, $options: 'i' };
  }

  // Filter by verification status
  if (status) {
    filter.verificationStatus = status;
  }

  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate('employerUserId', 'name email role accountStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Company.countDocuments(filter),
  ]);

  return {
    companies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single company by ID for Admin review.
 */
export async function getEmployerById(companyId) {
  const company = await Company.findById(companyId).populate(
    'employerUserId',
    'name email role accountStatus'
  );

  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }

  return company;
}

/**
 * Admin updates the verification status of a company (verify / reject).
 */
export async function updateVerificationStatus(companyId, newStatus) {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }

  if (company.verificationStatus === newStatus) {
    throw new ApiError(400, `Company verification status is already '${newStatus}'.`);
  }

  company.verificationStatus = newStatus;
  await company.save();

  // TODO: Danaja will likely hook into this action later to send an email notification to the employer

  return company;
}
