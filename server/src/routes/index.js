import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import companyRouter from './company.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/companies', companyRouter);

export default apiRouter;
