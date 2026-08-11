import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import reportRouter from './report.routes.js';
import supportRoutes from './support.routes.js';
import categoryRouter from './category.routes.js';
import skillRouter from './skill.routes.js';
import notificationRouter from './notification.routes.js';
import jobsRouter from './jobs.routes.js';
import jobRouter from './job.routes.js';
import jobSeekerProfileRouter from './jobSeekerProfile.routes.js';
import companyRouter from './company.routes.js';
import statisticsRouter from './statistics.routes.js';


const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/skills', skillRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/employer/jobs', jobRouter);
apiRouter.use('/job-seeker-profile', jobSeekerProfileRouter);
apiRouter.use('/companies', companyRouter);
apiRouter.use('/statistics', statisticsRouter);


export default apiRouter;
