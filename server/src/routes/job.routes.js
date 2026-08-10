import { Router } from 'express';
import {
  createJobController,
  listEmployerJobsController,
  getJobController,
  updateJobController,
} from '../controllers/job.controller.js';
import {
  createJobSchema,
  updateJobSchema,
  jobIdParamSchema,
} from '../validations/job.validation.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const jobRouter = Router();

jobRouter.post(
  '/',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(createJobSchema, 'body'),
  createJobController
);

jobRouter.get('/', protect, requireRole(USER_ROLES.EMPLOYER), listEmployerJobsController);

jobRouter.get(
  '/:jobId',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(jobIdParamSchema, 'params'),
  getJobController
);

jobRouter.patch(
  '/:jobId',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(jobIdParamSchema, 'params'),
  validate(updateJobSchema, 'body'),
  updateJobController
);

export default jobRouter;
