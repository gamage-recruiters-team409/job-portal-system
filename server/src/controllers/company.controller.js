import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import {
  createCompany,
  getMyCompany,
  getCompanyById,
  updateCompany,
  updateLogo,
} from '../services/company.service.js';

/**
 * POST /companies — Create a new company profile for the authenticated employer.
 */
export async function createCompanyController(req, res, next) {
  try {
    const company = await createCompany(req.user.id, req.body);
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
export async function getMyCompanyController(req, res, next) {
  try {
    const company = await getMyCompany(req.user.id);
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
export async function getCompanyByIdController(req, res, next) {
  try {
    const company = await getCompanyById(req.params.id);
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
export async function updateCompanyController(req, res, next) {
  try {
    const company = await updateCompany(req.user.id, req.body);
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
export async function updateLogoController(req, res, next) {
  let uploadedPublicId = null;
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a logo image file.');
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'company_logos');
    uploadedPublicId = uploadResult.public_id;

    const company = await updateLogo(req.user.id, uploadResult.secure_url, uploadResult.public_id);
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
