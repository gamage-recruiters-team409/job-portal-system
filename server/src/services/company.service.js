import mongoose from 'mongoose';
import Company from '../models/company.model.js';
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

  const company = await Company.create({
    ...payload,
    employerUserId: userId,
    verificationStatus: EMPLOYER_VERIFICATION_STATUSES.PENDING,
  });

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

/**
 * Update the logged-in employer's company profile.
 * If companyName or companyEmail is changed, reset verificationStatus to pending.
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

  Object.assign(company, updateData);

  if (resetVerification) {
    company.verificationStatus = EMPLOYER_VERIFICATION_STATUSES.PENDING;
  }

  await company.save();
  return company;
}

/**
 * Update company logo for the logged-in employer.
 * If company already has a logo, deletes the old image from Cloudinary first.
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

  if (company.companyLogoPublicId) {
    try {
      await deleteFromCloudinary(company.companyLogoPublicId);
    } catch (error) {
      console.error('Failed to delete old company logo from Cloudinary:', error);
    }
  }

  company.companyLogo = secureUrl;
  company.companyLogoPublicId = publicId;

  await company.save();
  return company;
}
