// server/src/routes/application.routes.js

import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { applyToJob } from '../controllers/application.controller.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

router.post('/', protect, requireRole(USER_ROLES.JOB_SEEKER), applyToJob);

export default router;