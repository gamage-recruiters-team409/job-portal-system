import { Router } from 'express';
import {
  listApplicantsController,
  getApplicantFilterOptionsController,
  getApplicantByIdController,
  updateApplicantStatusController,
  shortlistApplicantController,
  rejectApplicantController,
  getApplicantCvController,
} from '../controllers/applicant.controller.js';
import {
  listApplicantsQuerySchema,
  applicantIdParamSchema,
  updateStatusSchema,
  shortlistSchema,
  rejectSchema,
} from '../validations/applicant.validation.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/statuses.js';

const applicantRouter = Router();

// All routes in this module require a valid session and an employer or admin role.
applicantRouter.use(protect, requireRole(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN));

// GET /api/v1/applicants?jobId=&status=&search=&page=&limit=
applicantRouter.get('/', validate(listApplicantsQuerySchema, 'query'), listApplicantsController);

// GET /api/v1/applicants/filter-options
applicantRouter.get('/filter-options', getApplicantFilterOptionsController);

// GET /api/v1/applicants/:id
applicantRouter.get('/:id', validate(applicantIdParamSchema, 'params'), getApplicantByIdController);

// GET /api/v1/applicants/:id/cv
applicantRouter.get(
  '/:id/cv',
  validate(applicantIdParamSchema, 'params'),
  getApplicantCvController
);

// PATCH /api/v1/applicants/:id/status
applicantRouter.patch(
  '/:id/status',
  validate(applicantIdParamSchema, 'params'),
  validate(updateStatusSchema),
  updateApplicantStatusController
);

// PATCH /api/v1/applicants/:id/shortlist
applicantRouter.patch(
  '/:id/shortlist',
  validate(applicantIdParamSchema, 'params'),
  validate(shortlistSchema),
  shortlistApplicantController
);

// PATCH /api/v1/applicants/:id/reject
applicantRouter.patch(
  '/:id/reject',
  validate(applicantIdParamSchema, 'params'),
  validate(rejectSchema),
  rejectApplicantController
);

export default applicantRouter;
