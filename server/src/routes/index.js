import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import jobSeekerProfileRouter from './jobSeekerProfile.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/job-seeker-profile', jobSeekerProfileRouter);

export default apiRouter;
