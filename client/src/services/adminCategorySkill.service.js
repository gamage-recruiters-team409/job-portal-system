/**
 * @file adminCategorySkill.service.js
 * @description API service for managing job categories and skills in the Admin portal.
 * @module Services/AdminCategorySkill
 */

import apiClient from './apiClient';

/* ─── Category Service ─────────────────────────────────────────────────────── */

/**
 * Fetch all categories (including inactive) for Admin.
 * @returns {Promise<Object>} API response with categories array
 */
export const getAdminCategories = async () => {
  const { data } = await apiClient.get('/categories/all');
  return data;
};

/**
 * Create a new category.
 * @param {Object} payload
 * @param {string} payload.categoryName
 * @param {string} [payload.description]
 * @returns {Promise<Object>} API response with created category
 */
export const createCategory = async (payload) => {
  const { data } = await apiClient.post('/categories', payload);
  return data;
};

/**
 * Update an existing category.
 * @param {string} id - Category ID
 * @param {Object} payload
 * @param {string} [payload.categoryName]
 * @param {string} [payload.description]
 * @param {boolean} [payload.isActive]
 * @returns {Promise<Object>} API response with updated category
 */
export const updateCategory = async (id, payload) => {
  const { data } = await apiClient.patch(`/categories/${id}`, payload);
  return data;
};

/* ─── Skill Service ────────────────────────────────────────────────────────── */

/**
 * Fetch all skills (including inactive) for Admin.
 * @returns {Promise<Object>} API response with skills array
 */
export const getAdminSkills = async () => {
  const { data } = await apiClient.get('/skills/all');
  return data;
};

/**
 * Create a new skill.
 * @param {Object} payload
 * @param {string} payload.skillName
 * @param {string} [payload.categoryId]
 * @returns {Promise<Object>} API response with created skill
 */
export const createSkill = async (payload) => {
  const { data } = await apiClient.post('/skills', payload);
  return data;
};

/**
 * Update an existing skill.
 * @param {string} id - Skill ID
 * @param {Object} payload
 * @param {string} [payload.skillName]
 * @param {string} [payload.categoryId]
 * @param {boolean} [payload.isActive]
 * @returns {Promise<Object>} API response with updated skill
 */
export const updateSkill = async (id, payload) => {
  const { data } = await apiClient.patch(`/skills/${id}`, payload);
  return data;
};
