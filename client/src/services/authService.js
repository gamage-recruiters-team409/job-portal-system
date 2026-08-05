import apiClient from './apiClient.js';

/**
 * Authentication API calls.
 * The backend wraps every response as { success, message, data }.
 * Axios throws on non-2xx, so callers read error.response.data.message.
 */

/** POST /auth/register — create an account and return { token, user }. */
export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data.data;
}

/** POST /auth/login — verify credentials and return { token, user }. */
export async function login(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data.data;
}

/** GET /auth/me — return the currently authenticated user. */
export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
}
