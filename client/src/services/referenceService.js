import apiClient from './apiClient.js';

/**
 * Reference-data API calls (categories + skills).
 * Job documents expose category and skills as raw ObjectIds; these lookups
 * resolve them to display names. Both endpoints are public.
 */

/** GET /categories — returns { categories: [{ _id, name, ... }] }. */
export async function getCategories() {
  const { data } = await apiClient.get('/categories');
  return data.data.categories ?? [];
}

/** GET /skills — returns { skills: [{ _id, name, ... }] }. Optional ?categoryId filter. */
export async function getSkills(params = {}) {
  const { data } = await apiClient.get('/skills', { params });
  return data.data.skills ?? [];
}
