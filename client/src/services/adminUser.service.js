/**
 * @file adminUser.service.js
 * @description Frontend API service for interacting with the Admin User Management backend.
 * @module Services/AdminUser
 */

import apiClient from './apiClient';

/* ─── AdminUser Service ────────────────────────────────────────────────────── */

/**
 * Get paginated, searchable, filterable list of users for Admin.
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of items per page
 * @param {string} params.status - Filter by accountStatus (active/suspended/inactive)
 * @param {string} params.role - Filter by role (job_seeker/employer)
 * @param {string} params.search - Search by name or email
 */
export const getAdminUsers = async (params = {}) => {
  const { data } = await apiClient.get('/admin/users', { params });
  return data;
};

/**
 * Get a single user by ID for Admin view.
 * @param {string} userId - The ID of the user
 */
export const getAdminUserById = async (userId) => {
  const { data } = await apiClient.get(`/admin/users/${userId}`);
  return data;
};

/**
 * Admin creates a new user.
 * @param {Object} userData - The user payload
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.role - Role (job_seeker/employer)
 */
export const createAdminUser = async (userData) => {
  const { data } = await apiClient.post('/admin/users', userData);
  return data;
};

/**
 * Admin updates basic user fields.
 * @param {string} userId - The ID of the user
 * @param {Object} userData - The update payload (name, email, role)
 */
export const updateAdminUser = async (userId, userData) => {
  const { data } = await apiClient.patch(`/admin/users/${userId}`, userData);
  return data;
};

/**
 * Admin changes a user's account status.
 * @param {string} userId - The ID of the user
 * @param {string} status - New status (active/suspended/inactive)
 */
export const updateAdminUserStatus = async (userId, status) => {
  const { data } = await apiClient.patch(`/admin/users/${userId}/status`, { status });
  return data;
};

/**
 * Get user statistics for Admin dashboard cards.
 */
export const getAdminUserStats = async () => {
  const { data } = await apiClient.get('/admin/users/stats');
  return data;
};
