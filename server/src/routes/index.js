import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import categoryRouter from './category.routes.js';
import skillRouter from './skill.routes.js';
import jobsRouter from './jobs.routes.js';
import jobRouter from './job.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/skills', skillRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/employer/jobs', jobRouter);

export default apiRouter;
