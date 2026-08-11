import { Router } from 'express';

import {
  createReportController,
  getMyReportsController,
  getReportByIdController,
} from '../controllers/report.controller.js';

import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import { USER_ROLES } from '../constants/statuses.js';

import { createReportSchema } from '../validations/report.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  requireRole(USER_ROLES.JOB_SEEKER),
  validate(createReportSchema),
  createReportController
);

router.get('/my-reports', protect, requireRole(USER_ROLES.JOB_SEEKER), getMyReportsController);

router.get('/:id', protect, requireRole(USER_ROLES.JOB_SEEKER), getReportByIdController);

export default router;
