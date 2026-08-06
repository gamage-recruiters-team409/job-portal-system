import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getJobSeekerProfileByUserId,
  updateJobSeekerProfileByUserId,
  updateEducationEntryByUserId,
  updateExperienceEntryByUserId,
} from '../services/jobSeekerProfile.service.js';

/**
 * GET /job-seeker-profile/me
 * Returns the authenticated job seeker's profile.
 */
export async function getMyProfile(req, res, next) {
  try {
    const profile = await getJobSeekerProfileByUserId(req.user._id);

    if (!profile) {
      throw new ApiError(404, 'Job Seeker Profile not found.');
    }

    return sendSuccess(res, {
      message: 'Job Seeker Profile retrieved successfully.',
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me
 * Creates or updates the authenticated job seeker's basic profile details.
 */
export async function updateMyProfile(req, res, next) {
  try {
    const profile = await updateJobSeekerProfileByUserId(req.user._id, req.body);

    return sendSuccess(res, {
      message: 'Job Seeker Profile updated successfully.',
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me/education/:entryId
 * Updates one education entry owned by the authenticated job seeker.
 */
export async function updateMyEducationEntry(req, res, next) {
  try {
    const educationEntry = await updateEducationEntryByUserId(
      req.user._id,
      req.params.entryId,
      req.body
    );

    if (!educationEntry) {
      throw new ApiError(404, 'Education entry not found.');
    }

    return sendSuccess(res, {
      message: 'Education entry updated successfully.',
      data: { education: educationEntry },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me/experience/:entryId
 * Updates one experience entry owned by the authenticated job seeker.
 */
export async function updateMyExperienceEntry(req, res, next) {
  try {
    const experienceEntry = await updateExperienceEntryByUserId(
      req.user._id,
      req.params.entryId,
      req.body
    );

    if (!experienceEntry) {
      throw new ApiError(404, 'Experience entry not found.');
    }

    return sendSuccess(res, {
      message: 'Experience entry updated successfully.',
      data: { experience: experienceEntry },
    });
  } catch (error) {
    return next(error);
  }
}
