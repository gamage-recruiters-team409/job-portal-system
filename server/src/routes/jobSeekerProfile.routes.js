import { Router } from 'express';
import { USER_ROLES } from '../constants/statuses.js';
import {
  getMyProfile,
  updateMyProfile,
  updateMyEducationEntry,
  updateMyExperienceEntry,
  uploadMyProfileImage,
  deleteMyProfileImage,
  uploadMyCv,
  deleteMyCv,
} from '../controllers/jobSeekerProfile.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import {
  uploadJobSeekerProfileImage,
  uploadJobSeekerCv,
} from '../middleware/jobSeekerProfileUpload.js';
import { validate } from '../middleware/validate.js';
import {
  profileEntryIdSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updateJobSeekerProfileSchema,
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
 * DELETE /api/v1/job-seeker-profile/me/cv
 * Remove the authenticated Job Seeker's CV.
 */
jobSeekerProfileRouter.delete('/me/cv', deleteMyCv);

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
 * PATCH /api/v1/job-seeker-profile/me/experience/:entryId
 * Update one experience entry belonging to the authenticated Job Seeker.
 */
jobSeekerProfileRouter.patch(
  '/me/experience/:entryId',
  validate(profileEntryIdSchema, 'params'),
  validate(updateExperienceSchema),
  updateMyExperienceEntry
);

export default jobSeekerProfileRouter;
