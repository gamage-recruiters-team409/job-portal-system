import apiClient from './apiClient.js';

/**
 * Public Job Discovery API calls.
 * The backend wraps every response as { success, message, data }.
 * Axios throws on non-2xx, so callers read error.response.data.message.
 * All endpoints are public (no auth token required).
 */

/** GET /jobs — list published jobs (paginated). Returns { jobs, pagination }. */
export async function listJobs(params = {}) {
  const { data } = await apiClient.get('/jobs', { params });
  return data.data;
}

/** GET /jobs/search — keyword (q) + location search. Returns { jobs, pagination }. */
export async function searchJobs(params = {}) {
  const { data } = await apiClient.get('/jobs/search', { params });
  return data.data;
}

/** GET /jobs/filter — structured filter (jobType, workMode, salary, experience, postedDate). */
export async function filterJobs(params = {}) {
  const { data } = await apiClient.get('/jobs/filter', { params });
  return data.data;
}

/** GET /jobs/:id — job detail + similar jobs. Returns { job, similar }. */
export async function getJob(id) {
  const { data } = await apiClient.get(`/jobs/${id}`);
  return data.data;
}
