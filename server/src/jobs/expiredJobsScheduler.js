import { autoCloseAllExpiredJobs } from '../services/job.service.js';

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes

/**
 * Starts a periodic background check that auto-closes any published job
 * whose deadline has passed. Runs once immediately on startup, then on
 * a fixed interval for the lifetime of the process.
 */
export function startExpiredJobsScheduler() {
  const runCheck = async () => {
    try {
      const closedCount = await autoCloseAllExpiredJobs();
      if (closedCount > 0) {
        console.log(`Auto-closed ${closedCount} expired job(s).`);
      }
    } catch (error) {
      console.error('Expired jobs auto-close check failed.', error);
    }
  };

  runCheck();
  setInterval(runCheck, CHECK_INTERVAL_MS);
}
