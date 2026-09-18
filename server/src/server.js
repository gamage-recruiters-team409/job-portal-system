import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { startExpiredJobsScheduler } from './jobs/expiredJobsScheduler.js';
import { initSocket } from './realtime/socket.js';

// A plain Node HTTP server wrapping the Express app. Express keeps working
// exactly as before — this is only needed so Socket.IO has the same raw
// server to attach itself to.
const httpServer = createServer(app);

async function startServer() {
  try {
    await connectDatabase(env.mongodbUri);

    // Attach Socket.IO to the same server Express runs on, so real-time
    // notifications share the same port — no separate server/port needed.
    initSocket(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Job Portal API listening on port ${env.port}.`);
    });

    startExpiredJobsScheduler();
  } catch (error) {
    console.error('Server startup failed.', error);
    process.exit(1);
  }
}

startServer();
