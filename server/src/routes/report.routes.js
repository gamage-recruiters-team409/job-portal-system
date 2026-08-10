import { Router } from 'express';

import {
  createReportController,
  getMyReportsController,
  getReportByIdController,
} from '../controllers/report.controller.js';

import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import { createReportSchema } from '../validations/report.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  validate(createReportSchema),
  createReportController
);

router.get(
  '/my-reports',
  protect,
  getMyReportsController
);

router.get(
  '/:id',
  protect,
  getReportByIdController
);

export default router;