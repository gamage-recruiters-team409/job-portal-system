import { Router } from 'express';

import {
  createReportController,
  getMyReportsController,
  getReportByIdController,
  updateReportStatusController,
} from '../controllers/report.controller.js';

import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import {
  createReportSchema,
  updateReportStatusSchema,
} from '../validations/report.validation.js';


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


router.patch(
  '/:id/status',
  protect,
  validate(updateReportStatusSchema),
  updateReportStatusController
);


export default router;