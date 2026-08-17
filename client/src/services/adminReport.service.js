/**
 * @file adminReport.service.js
 * @description Frontend API service for interacting with the Admin Reported Jobs backend.
 * @module Services/AdminReport
 */

import apiClient from './apiClient';

/* ─── AdminReport Service ────────────────────────────────────────────────────── */

/**
 * Get a paginated list of admin reported jobs
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of items per page
 * @param {string} params.status - Filter by status (optional)
 * @param {string} params.search - Search by job title (optional)
 */
export const getAdminReports = async (params = {}) => {
  const { data } = await apiClient.get('/admin/reports', { params });
  return data;
};

/**
 * Get details of a single report by ID
 * @param {string} reportId - The ID of the report
 */
export const getAdminReportById = async (reportId) => {
  const { data } = await apiClient.get(`/admin/reports/${reportId}`);
  return data;
};

/**
 * Review a report (dismiss or resolve/suspend)
 * @param {string} reportId - The ID of the report
 * @param {Object} reviewData - The review payload
 * @param {string} reviewData.status - 'dismissed' | 'resolved'
 * @param {string} reviewData.reviewNote - Required note explaining the action
 * @param {string} reviewData.jobAction - 'keep' | 'suspend'
 */
export const reviewAdminReport = async (reportId, reviewData) => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/review`, reviewData);
  return data;
};
