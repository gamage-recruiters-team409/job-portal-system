// server/src/routes/savedJob.routes.js

import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import {
  saveJob,
  removeSavedJob,
  getSavedJobs,
} from '../controllers/savedJob.controller.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

router.use(protect, requireRole(USER_ROLES.JOB_SEEKER));

router.post('/', saveJob);
router.delete('/:jobId', removeSavedJob);
router.get('/', getSavedJobs);

export default router;