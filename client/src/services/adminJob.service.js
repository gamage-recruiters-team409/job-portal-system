/**
 * @file adminJob.service.js
 * @description Frontend API service for interacting with the Admin Job Management backend.
 * @module Services/AdminJob
 */

import apiClient from './apiClient';

/* ─── AdminJob Service ────────────────────────────────────────────────────── */

/**
 * Get a paginated, searchable, status-filtered list of jobs for Admin.
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.status] - Filter by job status ('published', 'pending_review', 'suspended', 'rejected', etc.)
 * @param {string} [params.search] - Search by job title
 */
export const getAdminJobs = async (params = {}) => {
  const { data } = await apiClient.get('/admin/jobs', { params });
  return data;
};

/**
 * Get full job details by ID for Admin view.
 * @param {string} jobId - The MongoDB ObjectId of the job
 */
export const getAdminJobById = async (jobId) => {
  const { data } = await apiClient.get(`/admin/jobs/${jobId}`);
  return data;
};

/**
 * Moderate a job's status (publish, suspend, or reject) with a mandatory review note.
 * @param {string} jobId - The MongoDB ObjectId of the job
 * @param {Object} moderationData - Moderation payload
 * @param {'published' | 'suspended' | 'rejected'} moderationData.status - Target status
 * @param {string} moderationData.reviewNote - Mandatory explanation note (10 - 500 chars)
 */
export const moderateAdminJob = async (jobId, moderationData) => {
  const { data } = await apiClient.patch(`/admin/jobs/${jobId}/moderation`, moderationData);
  return data;
};

/**
 * Get job statistics for Admin dashboard cards.
 */
export const getAdminJobStats = async () => {
  const { data } = await apiClient.get('/admin/jobs/stats');
  return data;
};
