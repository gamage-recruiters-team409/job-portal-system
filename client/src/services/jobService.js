import apiClient from './apiClient.js';

/**
 * Employer Job Management API calls (Disura).
 */

export const createJob = async (payload) => {
  const { data } = await apiClient.post('/employer/jobs', payload);
  return data;
};

export const getEmployerJobs = async () => {
  const { data } = await apiClient.get('/employer/jobs');
  return data;
};

export const getEmployerJobById = async (jobId) => {
  const { data } = await apiClient.get(`/employer/jobs/${jobId}`);
  return data;
};

export const updateJob = async (jobId, payload) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await apiClient.delete(`/employer/jobs/${jobId}`);
  return data;
};

export const submitJobForReview = async (jobId) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/submit-for-review`);
  return data;
};

export const closeJob = async (jobId, reason) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/close`, { reason });
  return data;
};

export const reopenJob = async (jobId, deadline) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/reopen`, { deadline });
  return data;
};

/**
 * Public Job Discovery API calls (Bimsara).
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

/**
 * In-memory client cache for job details.
 * Implements QA recommendation to reduce redundant roundtrips
 * and improve navigation responsiveness between list and detail views.
 */
const jobDetailCache = new Map();
const JOB_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

/** GET /jobs/:id — job detail + similar jobs. Returns { job, similar }. */
export async function getJob(id, { skipCache = false } = {}) {
  const cached = jobDetailCache.get(id);
  const now = Date.now();
  if (!skipCache && cached && now - cached.timestamp < JOB_CACHE_TTL_MS) {
    return cached.data;
  }
  const { data } = await apiClient.get(`/jobs/${id}`);
  jobDetailCache.set(id, { data: data.data, timestamp: now });
  return data.data;
}

/** Invalidate cached job detail (e.g. after an action). */
export function clearJobCache(id) {
  if (id) {
    jobDetailCache.delete(id);
  } else {
    jobDetailCache.clear();
  }
}
