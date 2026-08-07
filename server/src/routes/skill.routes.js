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
router.get('/', protect, getSkills);

// Admin only routes
router.use('/admin', protect, requireRole(USER_ROLES.ADMIN));
router.get('/admin', getAllSkillsAdmin);
router.post('/admin', createSkill);
router.patch('/admin/:id', updateSkill);

export default router;
