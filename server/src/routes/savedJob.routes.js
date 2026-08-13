// server/src/routes/savedJob.routes.js

import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveJob, removeSavedJob, getSavedJobs } from '../controllers/savedJob.controller.js';
import { saveJobSchema, savedJobIdParamSchema } from '../validations/savedJob.validation.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = Router();

router.use(protect, requireRole(USER_ROLES.JOB_SEEKER));

router.post('/', validate(saveJobSchema, 'body'), saveJob);
router.delete('/:jobId', validate(savedJobIdParamSchema, 'params'), removeSavedJob);
router.get('/', getSavedJobs);

export default router;
