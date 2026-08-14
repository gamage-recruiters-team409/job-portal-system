import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import {
  createCompany as createCompanyService,
  getMyCompany as getMyCompanyService,
  getCompanyById as getCompanyByIdService,
  updateCompany as updateCompanyService,
  updateLogo as updateLogoService,
  deleteCompany as deleteCompanyService,
} from '../services/company.service.js';

/**
 * POST /companies — Create a new company profile for the authenticated employer.
 */
export async function createCompany(req, res, next) {
  try {
    const company = await createCompanyService(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Company profile created successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /companies/me — Retrieve the authenticated employer's company profile.
 */
export async function getMyCompany(req, res, next) {
  try {
    const company = await getMyCompanyService(req.user.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Company profile retrieved successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /companies/:id — Retrieve a company profile by ID (public view).
 */
export async function getCompanyById(req, res, next) {
  try {
    const company = await getCompanyByIdService(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Company details retrieved successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /companies/me — Update the authenticated employer's company profile.
 */
export async function updateCompany(req, res, next) {
  try {
    const company = await updateCompanyService(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Company profile updated successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /companies/me/logo — Upload or update company logo for the authenticated employer.
 */
export async function uploadLogo(req, res, next) {
  let uploadedPublicId = null;
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a logo image file.');
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'company_logos');
    uploadedPublicId = uploadResult.public_id;

    const company = await updateLogoService(
      req.user.id,
      uploadResult.secure_url,
      uploadResult.public_id
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Company logo updated successfully.',
      data: { company },
    });
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await deleteFromCloudinary(uploadedPublicId);
      } catch (cleanupError) {
        console.error('Failed to cleanup Cloudinary upload on error:', cleanupError);
      }
    }
    return next(error);
  }
}

/**
 * DELETE /companies/me — Delete the authenticated employer's company profile.
 * Company is a shared model referenced by Jobs (see the NOTE in
 * company.service.js) — deleteCompanyService refuses with 409 if ANY job post
 * is still linked to the company (active, closed, or soft-deleted/archived),
 * so this can never orphan job data.
 */
export async function deleteCompany(req, res, next) {
  try {
    await deleteCompanyService(req.user.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Company profile deleted successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

// Aliases for compatibility
export {
  createCompany as createCompanyController,
  getMyCompany as getMyCompanyController,
  getCompanyById as getCompanyByIdController,
  updateCompany as updateCompanyController,
  uploadLogo as updateLogoController,
  deleteCompany as deleteCompanyController,
};
