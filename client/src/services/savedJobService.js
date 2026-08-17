import apiClient from './apiClient.js';

/**
 * Save a job posting for the authenticated Job Seeker.
 * Returns the saved-job object directly (data.data) to match the shared
 * Saved Jobs service contract from PR #49.
 * @param {string} jobId
 */
export const saveJob = async (jobId) => {
  const { data } = await apiClient.post('/saved-jobs', { jobId });
  return data.data;
};

/**
 * Remove a saved job posting for the authenticated Job Seeker.
 * @param {string} jobId
 */
export const removeSavedJob = async (jobId) => {
  const { data } = await apiClient.delete(`/saved-jobs/${jobId}`);
  return data;
};

/**
 * Get all saved jobs for the authenticated Job Seeker.
 * Returns array of saved jobs directly (matching shared Saved Jobs service contract).
 */
export const getSavedJobs = async () => {
  const { data } = await apiClient.get('/saved-jobs');
  return data.data;
};
