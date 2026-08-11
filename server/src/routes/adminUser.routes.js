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

// All routes require Admin authentication
router.use(protect, requireRole(USER_ROLES.ADMIN));

// GET /api/v1/admin/users — paginated, searchable, filterable user list
router.get('/', validate(getUsersQuerySchema, 'query'), getUsers);

// GET /api/v1/admin/users/stats — dashboard statistics
router.get('/stats', getUserStats);

// POST /api/v1/admin/users — admin creates a new user
router.post('/', validate(createUserSchema, 'body'), createUser);

// GET /api/v1/admin/users/:userId — single user details
router.get('/:userId', validate(userIdParamSchema, 'params'), getUserById);

// PATCH /api/v1/admin/users/:userId — edit user name/email/role
router.patch(
  '/:userId',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  updateUser
);

// PATCH /api/v1/admin/users/:userId/status — suspend/reactivate/ban
router.patch(
  '/:userId/status',
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  updateUserStatus
);

export default router;
