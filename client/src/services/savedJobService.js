import apiClient from './apiClient.js';

/**
 * Saved Jobs API calls (Job Seeker).
 * Backend wraps every response as { success, message, data }.
 * apiClient automatically attaches the auth token via its interceptor.
 */

/** POST /saved-jobs — save a job. */
export async function saveJob(jobId) {
  const { data } = await apiClient.post('/saved-jobs', { jobId });
  return data.data;
}

/** DELETE /saved-jobs/:jobId — remove a saved job. */
export async function removeSavedJob(jobId) {
  const { data } = await apiClient.delete(`/saved-jobs/${jobId}`);
  return data;
}

/** GET /saved-jobs — list the current job seeker's saved jobs. */
export async function getSavedJobs() {
  const { data } = await apiClient.get('/saved-jobs');
  return data.data;
}
