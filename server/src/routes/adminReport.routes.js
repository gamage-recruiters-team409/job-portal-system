import { Router } from 'express';
import * as adminReportController from '../controllers/adminReport.controller.js';
import * as adminReportValidation from '../validations/adminReport.validation.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

// Protect all admin report routes
router.use(protect, requireRole(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN));

router.get(
  '/',
  validate(adminReportValidation.getReportsQuerySchema, 'query'),
  adminReportController.getReports
);

router.get('/stats', adminReportController.getReportStats);


router.get(
  '/:reportId',
  validate(adminReportValidation.reportIdParamSchema, 'params'),
  adminReportController.getReportById
);

router.patch(
  '/:reportId/review',
  validate(adminReportValidation.reportIdParamSchema, 'params'),
  validate(adminReportValidation.reviewReportSchema, 'body'),
  adminReportController.reviewReport
);

export default router;
