// Single source of truth for the persisted auth session.
// Storing the token in localStorage keeps the AuthContext and the
// apiClient interceptor independent (no circular imports between them).
const TOKEN_KEY = 'job_portal_token';
const USER_KEY = 'job_portal_user';

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  set(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
