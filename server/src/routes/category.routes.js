import { Router } from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
} from '../controllers/category.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

// Publicly available (or at least authenticated without role restriction)
// Anyone logged in can see active categories (Job Seekers or Employers)
router.get('/', getCategories);

// Admin only routes
router.get('/all', protect, requireRole(USER_ROLES.ADMIN), getAllCategoriesAdmin);
router.post('/', protect, requireRole(USER_ROLES.ADMIN), createCategory);
router.patch('/:id', protect, requireRole(USER_ROLES.ADMIN), updateCategory);

export default router;
