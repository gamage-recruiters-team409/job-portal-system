import { Router } from 'express';
import { USER_ROLES } from '../constants/statuses.js';

import {
  addMyPortfolioLink,
  deleteMyPortfolioLink,
  updateMyPortfolioLink,
  addMyEducationEntry,
  addMyExperienceEntry,
  deleteMyEducationEntry,
  deleteMyExperienceEntry,
  deleteMyCv,
  deleteMyProfileImage,
  getMyCvDownloadUrl,
  getMyProfile,
  getMyProfileCompletion,
  updateMyEducationEntry,
  updateMyExperienceEntry,
  updateMyProfile,
  updateMySkills,
  uploadMyCv,
  uploadMyProfileImage,
} from '../controllers/jobSeekerProfile.controller.js';

import { protect, requireRole } from '../middleware/auth.js';

import {
  uploadJobSeekerProfileImage,
  uploadJobSeekerCv,
} from '../middleware/jobSeekerProfileUpload.js';

import { validate } from '../middleware/validate.js';

import {
  createEducationSchema,
  createExperienceSchema,
  createPortfolioLinkSchema,
  profileEntryIdSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updateJobSeekerProfileSchema,
  updatePortfolioLinkSchema,
  updateProfileSkillsSchema,
} from '../validations/jobSeekerProfile.validation.js';

const jobSeekerProfileRouter = Router();

/**
 * All routes below require an authenticated Job Seeker account.
 */
jobSeekerProfileRouter.use(protect, requireRole(USER_ROLES.JOB_SEEKER));

/**
 * GET /api/v1/job-seeker-profile/me
 * Retrieve the authenticated Job Seeker's profile.
 */
jobSeekerProfileRouter.get('/me', getMyProfile);

/**
 * PATCH /api/v1/job-seeker-profile/me
 * Update the authenticated Job Seeker's basic profile details.
 */
jobSeekerProfileRouter.patch('/me', validate(updateJobSeekerProfileSchema), updateMyProfile);

/**
 * PUT /api/v1/job-seeker-profile/me/profile-image
 * Upload or replace the authenticated Job Seeker's profile image.
 */
jobSeekerProfileRouter.put('/me/profile-image', uploadJobSeekerProfileImage, uploadMyProfileImage);

/**
 * DELETE /api/v1/job-seeker-profile/me/profile-image
 * Remove the authenticated Job Seeker's profile image.
 */
jobSeekerProfileRouter.delete('/me/profile-image', deleteMyProfileImage);

/**
 * PUT /api/v1/job-seeker-profile/me/cv
 * Upload or replace the authenticated Job Seeker's CV.
 */
jobSeekerProfileRouter.put('/me/cv', uploadJobSeekerCv, uploadMyCv);

/**
 * GET /api/v1/job-seeker-profile/me/cv/download-url
 * Generate a short-lived signed download URL for the authenticated
 * Job Seeker's CV.
 */
jobSeekerProfileRouter.get('/me/cv/download-url', getMyCvDownloadUrl);

/**
 * DELETE /api/v1/job-seeker-profile/me/cv
 * Remove the authenticated Job Seeker's CV.
 */
jobSeekerProfileRouter.delete('/me/cv', deleteMyCv);

/**
 * POST /api/v1/job-seeker-profile/me/education
 * Add one education entry to the authenticated Job Seeker's profile.
 */
jobSeekerProfileRouter.post('/me/education', validate(createEducationSchema), addMyEducationEntry);

/**
 * PATCH /api/v1/job-seeker-profile/me/education/:entryId
 * Update one education entry belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.patch(
  '/me/education/:entryId',
  validate(profileEntryIdSchema, 'params'),
  validate(updateEducationSchema),
  updateMyEducationEntry
);

/**
 * DELETE /api/v1/job-seeker-profile/me/education/:entryId
 * Delete one education entry belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.delete(
  '/me/education/:entryId',
  validate(profileEntryIdSchema, 'params'),
  deleteMyEducationEntry
);

/**
 * POST /api/v1/job-seeker-profile/me/experience
 * Add one experience entry to the authenticated Job Seeker's profile.
 */
jobSeekerProfileRouter.post(
  '/me/experience',
  validate(createExperienceSchema),
  addMyExperienceEntry
);

/**
 * PATCH /api/v1/job-seeker-profile/me/experience/:entryId
 * Update one experience entry belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.patch(
  '/me/experience/:entryId',
  validate(profileEntryIdSchema, 'params'),
  validate(updateExperienceSchema),
  updateMyExperienceEntry
);

/**
 * DELETE /api/v1/job-seeker-profile/me/experience/:entryId
 * Delete one experience entry belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.delete(
  '/me/experience/:entryId',
  validate(profileEntryIdSchema, 'params'),
  deleteMyExperienceEntry
);

/**
 * POST /api/v1/job-seeker-profile/me/portfolio
 * Add one portfolio link to the authenticated Job Seeker's profile.
 */
jobSeekerProfileRouter.post(
  '/me/portfolio',
  validate(createPortfolioLinkSchema),
  addMyPortfolioLink
);

/**
 * PATCH /api/v1/job-seeker-profile/me/portfolio/:entryId
 * Update one portfolio link belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.patch(
  '/me/portfolio/:entryId',
  validate(profileEntryIdSchema, 'params'),
  validate(updatePortfolioLinkSchema),
  updateMyPortfolioLink
);

/**
 * DELETE /api/v1/job-seeker-profile/me/portfolio/:entryId
 * Delete one portfolio link belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.delete(
  '/me/portfolio/:entryId',
  validate(profileEntryIdSchema, 'params'),
  deleteMyPortfolioLink
);

/**
 * GET /api/v1/job-seeker-profile/me/completion
 * Retrieve the dynamically calculated completion status
 * for the authenticated Job Seeker's profile.
 */
jobSeekerProfileRouter.get('/me/completion', getMyProfileCompletion);

/**
 * PATCH /api/v1/job-seeker-profile/me/skills
 * Update the Skill selections for the authenticated Job Seeker.
 */
jobSeekerProfileRouter.patch('/me/skills', validate(updateProfileSkillsSchema), updateMySkills);

export default jobSeekerProfileRouter;
