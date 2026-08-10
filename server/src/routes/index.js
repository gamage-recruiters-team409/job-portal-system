import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import jobsRouter from './jobs.routes.js';
import jobRouter from './job.routes.js';
import statisticsRouter from './statistics.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/employer/jobs', jobRouter);
apiRouter.use('/statistics', statisticsRouter);

export default apiRouter;
