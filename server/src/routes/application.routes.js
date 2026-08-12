// server/src/routes/application.routes.js

import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  applyToJob,
  getApplicationHistory,
  getApplicationDetails,
} from '../controllers/application.controller.js';
import {
  applyToJobSchema,
  applicationIdParamSchema,
} from '../validations/application.validation.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

router.use(protect, requireRole(USER_ROLES.JOB_SEEKER));

router.post('/', validate(applyToJobSchema, 'body'), applyToJob);
router.get('/', getApplicationHistory);
router.get('/:id', validate(applicationIdParamSchema, 'params'), getApplicationDetails);

export default router;
