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
router.get('/', protect, getCategories);

// Admin only routes
router.use('/admin', protect, requireRole(USER_ROLES.ADMIN));
router.get('/admin', getAllCategoriesAdmin);
router.post('/admin', createCategory);
router.patch('/admin/:id', updateCategory);

export default router;
