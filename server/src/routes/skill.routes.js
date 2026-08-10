import { Router } from 'express';
import {
  getSkills,
  getAllSkillsAdmin,
  createSkill,
  updateSkill,
} from '../controllers/skill.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

import { validate } from '../middleware/validate.js';
import {
  createSkillSchema,
  updateSkillSchema,
  skillIdSchema,
  getSkillsQuerySchema,
} from '../validations/skill.validation.js';

const router = Router();

// Publicly available (or at least authenticated without role restriction)
// Anyone logged in can see active skills (Job Seekers or Employers)
router.get('/', validate(getSkillsQuerySchema, 'query'), getSkills);

// Admin only routes
router.get('/all', protect, requireRole(USER_ROLES.ADMIN), getAllSkillsAdmin);
router.post(
  '/',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(createSkillSchema, 'body'),
  createSkill
);
router.patch(
  '/:id',
  protect,
  requireRole(USER_ROLES.ADMIN),
  validate(skillIdSchema, 'params'),
  validate(updateSkillSchema, 'body'),
  updateSkill
);

export default router;
