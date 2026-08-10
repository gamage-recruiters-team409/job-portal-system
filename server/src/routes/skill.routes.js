import { Router } from 'express';
import {
  getSkills,
  getAllSkillsAdmin,
  createSkill,
  updateSkill,
} from '../controllers/skill.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

// Publicly available (or at least authenticated without role restriction)
// Anyone logged in can see active skills (Job Seekers or Employers)
router.get('/', getSkills);

// Admin only routes
router.get('/all', protect, requireRole(USER_ROLES.ADMIN), getAllSkillsAdmin);
router.post('/', protect, requireRole(USER_ROLES.ADMIN), createSkill);
router.patch('/:id', protect, requireRole(USER_ROLES.ADMIN), updateSkill);

export default router;
