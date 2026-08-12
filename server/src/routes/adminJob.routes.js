import { Router } from 'express';
import * as adminJobController from '../controllers/adminJob.controller.js';
import * as adminJobValidation from '../validations/adminJob.validation.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

// Protect all admin job routes
router.use(protect, requireRole(USER_ROLES.ADMIN));

router.get(
  '/',
  validate(adminJobValidation.getJobsQuerySchema, 'query'),
  adminJobController.getJobs
);

router.get(
  '/:jobId',
  validate(adminJobValidation.jobIdParamSchema, 'params'),
  adminJobController.getJobById
);

router.patch(
  '/:jobId/moderation',
  validate(adminJobValidation.jobIdParamSchema, 'params'),
  validate(adminJobValidation.moderateJobSchema, 'body'),
  adminJobController.moderateJob
);

export default router;
