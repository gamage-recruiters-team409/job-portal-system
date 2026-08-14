import mongoose from 'mongoose';
import Company from '../models/company.model.js';
import Job from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';
import { EMPLOYER_VERIFICATION_STATUSES } from '../constants/statuses.js';
import { deleteFromCloudinary } from './cloudinary.service.js';

/**
 * Create a new company profile for an employer.
 * Reject if the employer already has a company profile or if name/email is taken.
 *
 * @param {string} userId - ID of the authenticated employer user
 * @param {object} data - Company creation data
 * @returns {Promise<import('mongoose').Document>}
 */
export async function createCompany(userId, data) {
  const existingCompany = await Company.findOne({ employerUserId: userId });
  if (existingCompany) {
    throw new ApiError(400, 'Employer already has a company profile.');
  }

  if (data.companyName) {
    const nameExists = await Company.findOne({ companyName: data.companyName.trim() });
    if (nameExists) {
      throw new ApiError(409, 'A company with this name already exists.');
    }
  }

  if (data.companyEmail) {
    const emailExists = await Company.findOne({
      companyEmail: data.companyEmail.trim().toLowerCase(),
    });
    if (emailExists) {
      throw new ApiError(409, 'A company with this email address already exists.');
    }
  }

  // Ensure restricted/system fields cannot be set directly by employer
  const payload = { ...data };
  delete payload.verificationStatus;
  delete payload.employerUserId;
  delete payload.companyLogo;
  delete payload.companyLogoPublicId;

  let company;
  try {
    company = await Company.create({
      ...payload,
      employerUserId: userId,
      verificationStatus: EMPLOYER_VERIFICATION_STATUSES.PENDING,
    });
  } catch (error) {
    // A concurrent request may have raced past the pre-checks above and
    // hit a unique index (companyName, companyEmail, or employerUserId).
    // Map E11000 explicitly so it never surfaces as 500.
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const FIELD_MESSAGES = {
        companyName: 'A company with this name already exists.',
        companyEmail: 'A company with this email address already exists.',
        employerUserId: 'Employer already has a company profile.',
      };
      throw new ApiError(409, FIELD_MESSAGES[field] || 'A record with this value already exists.');
    }
    throw error;
  }

  return company;
}

/**
 * Get the logged-in employer's own company profile.
 *
 * @param {string} userId - ID of the authenticated employer user
 * @returns {Promise<import('mongoose').Document>}
 */
export async function getMyCompany(userId) {
  const company = await Company.findOne({ employerUserId: userId });
  if (!company) {
    throw new ApiError(404, 'Company profile not found.');
  }
  return company;
}

// Approved public-facing fields for the public company endpoint.
// companyEmail, companyTelephone and companyAddress are pending Team Lead
// confirmation and must stay excluded until approved.
// employerUserId and companyLogoPublicId are internal and must never be exposed.
const PUBLIC_COMPANY_FIELDS =
  'companyName companyLogo industry companySize website companyDescription companyLocation verificationStatus';

/**
 * Get a company profile by ID (public view).
 * Only verified companies are visible publicly, and only approved fields
 * are returned — internal fields (employerUserId, companyLogoPublicId) are
 * never exposed.
 *
 * @param {string} id - Company ID
 * @returns {Promise<import('mongoose').Document>}
 */
export async function getCompanyById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid company ID format.');
  }

  const company = await Company.findOne(
    { _id: id, verificationStatus: EMPLOYER_VERIFICATION_STATUSES.VERIFIED },
    PUBLIC_COMPANY_FIELDS
  );
  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }
  return company;
}

// Every profile field requires re-verification when changed, except
// companyDescription (per Sahan). companyName and companyEmail are checked
// separately below (uniqueness checks apply). companyLogo never appears in
// `data` here — logo updates go through updateLogo, which applies its own
// re-verification reset.
const REVERIFICATION_FIELDS = [
  'companyTelephone',
  'industry',
  'companySize',
  'companyAddress',
  'companyLocation',
  'website',
  'foundedYear',
];

function hasFieldChanged(newValue, oldValue, supplied) {
  // If the key was not present in the request body at all, treat it as
  // unchanged — the employer did not mention this field.
  if (!supplied) {
    return false;
  }
  // Zod preprocessing can turn '' / null into undefined for optional fields
  // like `website` and `foundedYear`. When the key WAS supplied but parsed
  // to undefined it means the employer explicitly cleared the field.
  // Compare the normalised old value (undefined / null → '') so that
  // clearing an already-empty field is still a no-op.
  const normalise = (v) => (v === undefined || v === null ? '' : v);
  if (newValue === undefined || typeof newValue === 'string') {
    return (newValue ?? '') !== normalise(oldValue);
  }
  return newValue !== oldValue;
}

/**
 * Update the logged-in employer's company profile.
 * verificationStatus resets to pending if any re-verification field changes
 * (see REVERIFICATION_FIELDS, plus companyName and companyEmail below;
 * companyLogo is handled separately by updateLogo).
 *
 * @param {string} userId - ID of the authenticated employer user
 * @param {object} data - Company update payload
 * @returns {Promise<import('mongoose').Document>}
 */
export async function updateCompany(userId, data) {
  const company = await Company.findOne({ employerUserId: userId });
  if (!company) {
    throw new ApiError(404, 'Company profile not found. Please create one first.');
  }

  const updateData = { ...data };
  // Strip admin/system fields to prevent direct manipulation
  delete updateData.verificationStatus;
  delete updateData.employerUserId;
  delete updateData.companyLogo;
  delete updateData.companyLogoPublicId;

  let resetVerification = false;

  if (updateData.companyName && updateData.companyName.trim() !== company.companyName) {
    const trimmedName = updateData.companyName.trim();
    const nameExists = await Company.findOne({
      companyName: trimmedName,
      _id: { $ne: company._id },
    });
    if (nameExists) {
      throw new ApiError(409, 'A company with this name already exists.');
    }
    resetVerification = true;
  }

  if (
    updateData.companyEmail &&
    updateData.companyEmail.trim().toLowerCase() !== company.companyEmail.toLowerCase()
  ) {
    const trimmedEmail = updateData.companyEmail.trim().toLowerCase();
    const emailExists = await Company.findOne({
      companyEmail: trimmedEmail,
      _id: { $ne: company._id },
    });
    if (emailExists) {
      throw new ApiError(409, 'A company with this email address already exists.');
    }
    resetVerification = true;
  }

  for (const field of REVERIFICATION_FIELDS) {
    if (hasFieldChanged(updateData[field], company[field], field in updateData)) {
      resetVerification = true;
      break;
    }
  }

  Object.assign(company, updateData);

  if (resetVerification) {
    company.verificationStatus = EMPLOYER_VERIFICATION_STATUSES.PENDING;
  }

  try {
    await company.save();
  } catch (error) {
    // A concurrent request may have slipped past the pre-checks above and
    // hit a unique index (companyName, companyEmail, or employerUserId).
    // Map E11000 explicitly so it never surfaces as 500.
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const FIELD_MESSAGES = {
        companyName: 'A company with this name already exists.',
        companyEmail: 'A company with this email address already exists.',
        employerUserId: 'Employer already has a company profile.',
      };
      throw new ApiError(409, FIELD_MESSAGES[field] || 'A record with this value already exists.');
    }
    throw error;
  }
  return company;
}

/**
 * Update company logo for the logged-in employer.
 * Saves the new logo to the database first; the old Cloudinary image is only
 * deleted after that save succeeds, so a failed save never leaves the
 * database pointing at an already-deleted image. If the save fails, the
 * newly uploaded image is cleaned up instead and the old logo is left
 * untouched.
 * companyLogo is a re-verification field (see REVERIFICATION_FIELDS comment
 * above updateCompany), so verificationStatus resets to pending here too.
 *
 * @param {string} userId - ID of the authenticated employer user
 * @param {string} secureUrl - Cloudinary secure URL of new logo
 * @param {string} publicId - Cloudinary public ID of new logo
 * @returns {Promise<import('mongoose').Document>}
 */
export async function updateLogo(userId, secureUrl, publicId) {
  const company = await Company.findOne({ employerUserId: userId });
  if (!company) {
    throw new ApiError(404, 'Company profile not found.');
  }

  const oldPublicId = company.companyLogoPublicId;

  company.companyLogo = secureUrl;
  company.companyLogoPublicId = publicId;
  company.verificationStatus = EMPLOYER_VERIFICATION_STATUSES.PENDING;

  try {
    await company.save();
  } catch (error) {
    // Save failed — the database still points at the old logo, so clean up
    // the orphaned new upload instead of the old one.
    try {
      await deleteFromCloudinary(publicId);
    } catch (cleanupError) {
      console.error('Failed to clean up newly uploaded logo after save failure:', cleanupError);
    }
    throw error;
  }

  // Save succeeded — the old image is no longer referenced, safe to delete.
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error('Failed to delete old company logo from Cloudinary:', error);
    }
  }

  return company;
}

// NOTE (Company <-> Job integrity guard): Company is a shared model — Jobs
// (Disura's module) reference it via Job.companyId, required + indexed. If a
// company is deleted while jobs still point at it, every one of those jobs
// becomes permanently orphaned (Job.companyId would resolve to nothing, and
// there is no cascade-delete or reassignment path for jobs elsewhere in the
// codebase). This MUST count soft-deleted jobs too (isDeleted: true), not
// just active ones — Job soft-delete exists specifically to retain the
// document for history, and a soft-deleted Job still has a required,
// still-valid companyId pointing at this Company. Filtering on
// isDeleted: false here would let an employer soft-delete every job and then
// hard-delete the Company, leaving those retained historical Job documents
// pointing at a Company that no longer exists. So deleteCompany() below
// refuses to delete while ANY job document (active or soft-deleted) still
// references this company — a hard product constraint, not just a
// nice-to-have, until/unless an explicitly approved cascade/snapshot/
// Company-soft-delete strategy exists.
// Flagged by @SithumBuddhika in PR review — do not loosen this guard without
// re-confirming with him and the PR Team Leader first.
/**
 * Delete the logged-in employer's company profile.
 * Refuses (409) if ANY job — active or soft-deleted — still references this
 * company, so deletion can never orphan job data (including retained
 * historical/soft-deleted job records). The database deletion happens first,
 * and the Cloudinary logo is cleaned up best-effort afterward — see the note
 * below for why the order matters.
 *
 * @param {string} userId - ID of the authenticated employer user
 * @returns {Promise<void>}
 */
export async function deleteCompany(userId) {
  const company = await Company.findOne({ employerUserId: userId });
  if (!company) {
    throw new ApiError(404, 'Company profile not found.');
  }

  const jobCount = await Job.countDocuments({ companyId: company._id });
  if (jobCount > 0) {
    throw new ApiError(
      409,
      'Cannot delete this company because it has associated job records (including closed or archived positions). Companies with retained job history cannot currently be permanently deleted.'
    );
  }

  // Delete the database record BEFORE touching Cloudinary — same ordering
  // principle updateLogo already follows for updates. If Cloudinary were
  // deleted first and company.deleteOne() then failed, the API would report
  // the deletion as failed while the Company document still exists, now
  // pointing at a logo asset that's already gone. Deleting the DB record
  // first means the only failure mode left is "logo asset leaked in
  // Cloudinary after a successful deletion," which is a harmless orphan
  // (logged, not surfaced to the employer) rather than a corrupted record.
  await company.deleteOne();

  if (company.companyLogoPublicId) {
    try {
      await deleteFromCloudinary(company.companyLogoPublicId);
    } catch (error) {
      console.error('Failed to delete company logo from Cloudinary after company deletion:', error);
    }
  }
}
