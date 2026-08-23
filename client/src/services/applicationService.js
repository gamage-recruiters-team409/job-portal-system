import apiClient from './apiClient.js';

/**
 * Application API calls (Job Seeker).
 * Backend derives the CV automatically from the Job Seeker's approved
 * profile — the frontend never uploads or references a resume file here.
 */

/** POST /applications — apply for a job. */
export async function applyToJob(jobId, coverLetter) {
  const { data } = await apiClient.post('/applications', { jobId, coverLetter });
  return data.data;
}

/** GET /applications — the current job seeker's application history. */
export async function getApplicationHistory() {
  const { data } = await apiClient.get('/applications');
  return data.data;
}

/** GET /applications/:id — a single application's details. */
export async function getApplicationDetails(applicationId) {
  const { data } = await apiClient.get(`/applications/${applicationId}`);
  return data.data;
}