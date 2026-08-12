import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  getUserStats,
} from '../controllers/adminUser.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';
import { validate } from '../middleware/validate.js';
import {
  getUsersQuerySchema,
  userIdParamSchema,
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '../validations/adminUser.validation.js';

const router = Router();

// GET /api/v1/admin/users — paginated, searchable, filterable user list
router.get(
  '/',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(getUsersQuerySchema, 'query'),
  getUsers
);

// GET /api/v1/admin/users/stats — dashboard statistics
router.get('/stats', protect, requireRole(USER_ROLES.ADMIN), getUserStats);

// POST /api/v1/admin/users — admin creates a new user
router.post(
  '/',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(createUserSchema, 'body'),
  createUser
);

// GET /api/v1/admin/users/:userId — single user details
router.get(
  '/:userId',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  getUserById
);

// PATCH /api/v1/admin/users/:userId — edit user name/email/role
router.patch(
  '/:userId',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  updateUser
);

// PATCH /api/v1/admin/users/:userId/status — suspend/reactivate/ban
router.patch(
  '/:userId/status',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  updateUserStatus
);

export default router;
