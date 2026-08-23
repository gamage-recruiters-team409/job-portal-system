import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { startExpiredJobsScheduler } from './jobs/expiredJobsScheduler.js';

async function startServer() {
  try {
    await connectDatabase(env.mongodbUri);

    app.listen(env.port, () => {
      console.log(`Job Portal API listening on port ${env.port}.`);
    });

    startExpiredJobsScheduler();
  } catch (error) {
    console.error('Server startup failed.', error);
    process.exit(1);
  }
}

startServer();
