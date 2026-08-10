import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

import {
  addPortfolioLinkByUserId,
  deletePortfolioLinkByUserId,
  updatePortfolioLinkByUserId,
  addEducationEntryByUserId,
  addExperienceEntryByUserId,
  deleteEducationEntryByUserId,
  deleteExperienceEntryByUserId,
  getJobSeekerProfileByUserId,
  removeCvByUserId,
  removeProfileImageByUserId,
  saveCvByUserId,
  saveProfileImageByUserId,
  updateEducationEntryByUserId,
  updateExperienceEntryByUserId,
  updateJobSeekerProfileByUserId,
} from '../services/jobSeekerProfile.service.js';

import {
  uploadJobSeekerProfileImage,
  deleteJobSeekerProfileImage,
  uploadJobSeekerCv,
  deleteJobSeekerCv,
  generateJobSeekerCvDownloadUrl,
} from '../services/jobSeekerProfileMedia.service.js';

const deleteCloudinaryAssetQuietly = (deleteAsset, publicId) =>
  publicId ? deleteAsset(publicId).catch(() => null) : Promise.resolve(null);

/**
 * GET /job-seeker-profile/me
 * Returns the authenticated Job Seeker's profile.
 */
export async function getMyProfile(req, res, next) {
  try {
    const profile = await getJobSeekerProfileByUserId(req.user._id);

    if (!profile) {
      throw new ApiError(404, 'Job Seeker Profile not found.');
    }

    return sendSuccess(res, {
      message: 'Job Seeker Profile retrieved successfully.',
      data: {
        profile,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me
 * Creates or updates the authenticated Job Seeker's basic profile details.
 */
export async function updateMyProfile(req, res, next) {
  try {
    const profile = await updateJobSeekerProfileByUserId(req.user._id, req.body);

    return sendSuccess(res, {
      message: 'Job Seeker Profile updated successfully.',
      data: {
        profile,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me/education/:entryId
 * Updates one education entry owned by the authenticated Job Seeker.
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
      data: {
        education: educationEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me/experience/:entryId
 * Updates one experience entry owned by the authenticated Job Seeker.
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
      data: {
        experience: experienceEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /job-seeker-profile/me/profile-image
 * Uploads or replaces the authenticated Job Seeker's profile image.
 */
export async function uploadMyProfileImage(req, res, next) {
  let uploadedImage = null;
  let imagePersisted = false;

  try {
    if (!req.file) {
      throw new ApiError(400, 'A profile image file is required.');
    }

    const existingProfile = await getJobSeekerProfileByUserId(req.user._id);
    const previousPublicId = existingProfile?.profileImage?.publicId;

    uploadedImage = await uploadJobSeekerProfileImage(req.file.buffer);

    const profile = await saveProfileImageByUserId(req.user._id, {
      imageUrl: uploadedImage.secureUrl,
      publicId: uploadedImage.publicId,
    });

    imagePersisted = true;

    if (previousPublicId && previousPublicId !== uploadedImage.publicId) {
      await deleteCloudinaryAssetQuietly(deleteJobSeekerProfileImage, previousPublicId);
    }

    return sendSuccess(res, {
      message: 'Profile image uploaded successfully.',
      data: {
        profileImage: profile.profileImage,
      },
    });
  } catch (error) {
    if (uploadedImage?.publicId && !imagePersisted) {
      await deleteCloudinaryAssetQuietly(deleteJobSeekerProfileImage, uploadedImage.publicId);
    }

    return next(error);
  }
}

/**
 * DELETE /job-seeker-profile/me/profile-image
 * Removes the authenticated Job Seeker's profile image.
 */
export async function deleteMyProfileImage(req, res, next) {
  try {
    const existingProfile = await getJobSeekerProfileByUserId(req.user._id);
    const existingPublicId = existingProfile?.profileImage?.publicId;

    if (!existingPublicId) {
      throw new ApiError(404, 'Profile image not found.');
    }

    const profile = await removeProfileImageByUserId(req.user._id);

    if (!profile) {
      throw new ApiError(404, 'Job Seeker Profile not found.');
    }

    await deleteCloudinaryAssetQuietly(deleteJobSeekerProfileImage, existingPublicId);

    return sendSuccess(res, {
      message: 'Profile image removed successfully.',
      data: {
        profileImage: profile.profileImage,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /job-seeker-profile/me/cv
 * Uploads or replaces the authenticated Job Seeker's CV.
 */
export async function uploadMyCv(req, res, next) {
  let uploadedCv = null;
  let cvPersisted = false;

  try {
    if (!req.file) {
      throw new ApiError(400, 'A CV file is required.');
    }

    const existingProfile = await getJobSeekerProfileByUserId(req.user._id);
    const previousPublicId = existingProfile?.cv?.publicId;

    uploadedCv = await uploadJobSeekerCv(req.file.buffer);

    const profile = await saveCvByUserId(req.user._id, {
      fileName: req.file.originalname,
      fileUrl: uploadedCv.secureUrl,
      publicId: uploadedCv.publicId,
      uploadedAt: new Date(),
    });

    cvPersisted = true;

    if (previousPublicId && previousPublicId !== uploadedCv.publicId) {
      await deleteJobSeekerCv(previousPublicId);
    }

    return sendSuccess(res, {
      message: 'CV uploaded successfully.',
      data: {
        cv: profile.cv,
      },
    });
  } catch (error) {
    if (uploadedCv?.publicId && !cvPersisted) {
      await deleteCloudinaryAssetQuietly(deleteJobSeekerCv, uploadedCv.publicId);
    }

    return next(error);
  }
}

/**
 * GET /job-seeker-profile/me/cv/download-url
 * Generates a short-lived signed download URL for the authenticated
 * Job Seeker's CV.
 */
export async function getMyCvDownloadUrl(req, res, next) {
  try {
    const profile = await getJobSeekerProfileByUserId(req.user._id);
    const publicId = profile?.cv?.publicId;

    if (!publicId) {
      throw new ApiError(404, 'CV not found.');
    }

    const { downloadUrl, expiresAt } = generateJobSeekerCvDownloadUrl(publicId);

    return sendSuccess(res, {
      message: 'Secure CV download link generated successfully.',
      data: {
        downloadUrl,
        expiresAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /job-seeker-profile/me/cv
 * Removes the authenticated Job Seeker's CV.
 */
export async function deleteMyCv(req, res, next) {
  try {
    const existingProfile = await getJobSeekerProfileByUserId(req.user._id);
    const existingPublicId = existingProfile?.cv?.publicId;

    if (!existingPublicId) {
      throw new ApiError(404, 'CV not found.');
    }

    await deleteJobSeekerCv(existingPublicId);

    const profile = await removeCvByUserId(req.user._id);

    if (!profile) {
      throw new ApiError(404, 'Job Seeker Profile not found.');
    }

    return sendSuccess(res, {
      message: 'CV removed successfully.',
      data: {
        cv: profile.cv,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /job-seeker-profile/me/education
 * Adds one education entry to the authenticated Job Seeker's profile.
 */
export async function addMyEducationEntry(req, res, next) {
  try {
    const educationEntry = await addEducationEntryByUserId(req.user._id, req.body);

    return sendSuccess(res, {
      message: 'Education entry added successfully.',
      data: {
        education: educationEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /job-seeker-profile/me/education/:entryId
 * Deletes one education entry owned by the authenticated Job Seeker.
 */
export async function deleteMyEducationEntry(req, res, next) {
  try {
    const educationEntry = await deleteEducationEntryByUserId(req.user._id, req.params.entryId);

    if (!educationEntry) {
      throw new ApiError(404, 'Education entry not found.');
    }

    return sendSuccess(res, {
      message: 'Education entry deleted successfully.',
      data: {
        education: educationEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /job-seeker-profile/me/experience
 * Adds one experience entry to the authenticated Job Seeker's profile.
 */
export async function addMyExperienceEntry(req, res, next) {
  try {
    const experienceEntry = await addExperienceEntryByUserId(req.user._id, req.body);

    return sendSuccess(res, {
      message: 'Experience entry added successfully.',
      data: {
        experience: experienceEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /job-seeker-profile/me/experience/:entryId
 * Deletes one experience entry owned by the authenticated Job Seeker.
 */
export async function deleteMyExperienceEntry(req, res, next) {
  try {
    const experienceEntry = await deleteExperienceEntryByUserId(req.user._id, req.params.entryId);

    if (!experienceEntry) {
      throw new ApiError(404, 'Experience entry not found.');
    }

    return sendSuccess(res, {
      message: 'Experience entry deleted successfully.',
      data: {
        experience: experienceEntry,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /job-seeker-profile/me/portfolio
 * Adds one portfolio link to the authenticated Job Seeker's profile.
 */
export async function addMyPortfolioLink(req, res, next) {
  try {
    const portfolioLink = await addPortfolioLinkByUserId(req.user._id, req.body);

    return sendSuccess(res, {
      message: 'Portfolio link added successfully.',
      data: {
        portfolioLink,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /job-seeker-profile/me/portfolio/:entryId
 * Updates one portfolio link owned by the authenticated Job Seeker.
 */
export async function updateMyPortfolioLink(req, res, next) {
  try {
    const portfolioLink = await updatePortfolioLinkByUserId(
      req.user._id,
      req.params.entryId,
      req.body
    );

    if (!portfolioLink) {
      throw new ApiError(404, 'Portfolio link not found.');
    }

    return sendSuccess(res, {
      message: 'Portfolio link updated successfully.',
      data: {
        portfolioLink,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /job-seeker-profile/me/portfolio/:entryId
 * Deletes one portfolio link owned by the authenticated Job Seeker.
 */
export async function deleteMyPortfolioLink(req, res, next) {
  try {
    const portfolioLink = await deletePortfolioLinkByUserId(req.user._id, req.params.entryId);

    if (!portfolioLink) {
      throw new ApiError(404, 'Portfolio link not found.');
    }

    return sendSuccess(res, {
      message: 'Portfolio link deleted successfully.',
      data: {
        portfolioLink,
      },
    });
  } catch (error) {
    return next(error);
  }
}
