import { Router } from 'express';
import { list, search, filter, detail } from '../controllers/job.controller.js';
import {
  listJobsSchema,
  searchJobsSchema,
  filterJobsSchema,
  jobIdSchema,
} from '../validations/job.validation.js';
import { validate } from '../middleware/validate.js';
import { attachUserIfPresent } from '../middleware/auth.js';

const jobsRouter = Router();

// All public job routes are read-only and require no authentication.
// `validate(schema, 'query')` validates the request's query string.
jobsRouter.get('/', validate(listJobsSchema, 'query'), list);
jobsRouter.get('/search', validate(searchJobsSchema, 'query'), search);
jobsRouter.get('/filter', validate(filterJobsSchema, 'query'), filter);
// Static paths are declared before the dynamic :id to avoid /:id swallowing them.
// attachUserIfPresent lets us know if the viewer is logged in, without requiring it,
// so getJobDetail can skip the view-count increment for the job's own employer.
jobsRouter.get('/:id', attachUserIfPresent, validate(jobIdSchema, 'params'), detail);

export default jobsRouter;
