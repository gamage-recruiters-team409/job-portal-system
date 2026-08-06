import { Router } from 'express';
import {
  createCompanyController,
  getMyCompanyController,
  getCompanyByIdController,
  updateCompanyController,
  updateLogoController,
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
  createCompanyController
);

companyRouter.get('/me', protect, requireRole(USER_ROLES.EMPLOYER), getMyCompanyController);

companyRouter.put(
  '/me',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  validate(updateCompanySchema),
  updateCompanyController
);

companyRouter.put(
  '/me/logo',
  protect,
  requireRole(USER_ROLES.EMPLOYER),
  uploadCompanyLogo,
  updateLogoController
);

// Public route to view company profile by ID
companyRouter.get('/:id', getCompanyByIdController);

export default companyRouter;
