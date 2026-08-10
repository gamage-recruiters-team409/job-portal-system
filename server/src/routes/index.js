import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import reportRouter from './report.routes.js';
import jobsRouter from './jobs.routes.js';
import jobRouter from './job.routes.js';


const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/employer/jobs', jobRouter);


export default apiRouter;
