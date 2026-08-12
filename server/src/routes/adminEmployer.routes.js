import { Router } from 'express';
import {
  getEmployers,
  getEmployerById,
  updateVerificationStatus,
} from '../controllers/adminEmployer.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getEmployersQuerySchema,
  companyIdParamSchema,
  verifyEmployerSchema,
} from '../validations/adminEmployer.validation.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

// GET /api/v1/admin/employers - List all companies (searchable, filterable by verification status)
router.get(
  '/',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(getEmployersQuerySchema, 'query'),
  getEmployers
);

// GET /api/v1/admin/employers/:companyId - Get specific company details
router.get(
  '/:companyId',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(companyIdParamSchema, 'params'),
  getEmployerById
);

// PATCH /api/v1/admin/employers/:companyId/verification - Approve or reject an employer profile
router.patch(
  '/:companyId/verification',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(companyIdParamSchema, 'params'),
  validate(verifyEmployerSchema, 'body'),
  updateVerificationStatus
);

export default router;
