import { Router } from 'express';
import {
  employerStatistics,
  jobSeekerStatistics,
  adminStatistics,
} from '../controllers/statistics.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const statisticsRouter = Router();

statisticsRouter.get('/employer', protect, requireRole(USER_ROLES.EMPLOYER), employerStatistics);
statisticsRouter.get(
  '/job-seeker',
  protect,
  requireRole(USER_ROLES.JOB_SEEKER),
  jobSeekerStatistics
);
statisticsRouter.get('/admin', protect, requireRole(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN), adminStatistics);

export default statisticsRouter;
