/**
 * @file adminEmployer.service.js
 * @description Frontend API service for interacting with the Admin Manage Employers backend.
 * @module Services/AdminEmployer
 */

import apiClient from './apiClient';

/* ─── AdminEmployer Service ────────────────────────────────────────────────── */

/**
 * Get paginated, searchable, filterable list of employers for Admin.
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of items per page
 * @param {string} params.status - Filter by verificationStatus (pending/verified/rejected)
 * @param {string} params.search - Search by company name
 */
export const getAdminEmployers = async (params = {}) => {
  const { data } = await apiClient.get('/admin/employers', { params });
  return data;
};

/**
 * Get a single company/employer by ID for Admin view.
 * @param {string} companyId - The ID of the company
 */
export const getAdminEmployerById = async (companyId) => {
  const { data } = await apiClient.get(`/admin/employers/${companyId}`);
  return data;
};

/**
 * Admin updates the verification status of a company (verify / reject).
 * @param {string} companyId - The ID of the company
 * @param {string} status - New verification status (verified/rejected)
 */
export const updateEmployerVerification = async (companyId, status) => {
  const { data } = await apiClient.patch(`/admin/employers/${companyId}/verification`, { status });
  return data;
};
