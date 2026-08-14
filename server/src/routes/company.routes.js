import { Router } from 'express';
import {
  createCompany,
  getMyCompany,
  getCompanyById,
  updateCompany,
  uploadLogo,
  deleteCompany,
} from '../controllers/company.controller.js';
import { companySchema, updateCompanySchema } from '../validations/company.validation.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';
import { uploadCompanyLogo } from '../middleware/upload.js';

const companyRouter = Router();

// Logged-in employer routes (Must precede /:id to prevent route shadowing)
companyRouter.post(
  '/',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(companySchema),
  createCompany
);

companyRouter.get('/me', protect, requireRole(USER_ROLES.EMPLOYER), getMyCompany);

companyRouter.put(
  '/me',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(updateCompanySchema),
  updateCompany
);

// Deletion is blocked by a 409 guard (see the NOTE in company.service.js) if
// ANY job post is still linked to the company — active, closed, or
// soft-deleted/archived — since Company is shared with Jobs and must never
// be deleted out from under them.
companyRouter.delete('/me', protect, requireRole(USER_ROLES.EMPLOYER), deleteCompany);

// Logo upload route (POST & PUT supported)
companyRouter.post(
  '/me/logo',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  uploadCompanyLogo,
  uploadLogo
);

companyRouter.put(
  '/me/logo',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  uploadCompanyLogo,
  uploadLogo
);

// Public route to view company profile by ID
companyRouter.get('/:id', getCompanyById);

export default companyRouter;
