import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import jobsRouter from './jobs.routes.js';
import jobRouter from './job.routes.js';
import jobSeekerProfileRouter from './jobSeekerProfile.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/employer/jobs', jobRouter);
apiRouter.use('/job-seeker-profile', jobSeekerProfileRouter);

export default apiRouter;
