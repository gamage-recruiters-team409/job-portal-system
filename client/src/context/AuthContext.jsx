import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authStorage } from '../config/authStorage.js';
import * as authService from '../services/authService.js';

const AuthContext = createContext(undefined);

/**
 * Global auth store.
 *
 * - Restores a persisted session on mount (token + cached user), then
 *   revalidates the token against GET /auth/me so a stale/invalid token
 *   is cleared instead of leaving the UI in a fake logged-in state.
 * - Exposes login / register / logout used by the auth pages.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [token, setToken] = useState(() => authStorage.getToken());
  const [isLoading, setIsLoading] = useState(Boolean(authStorage.getToken()));

  // Revalidate any restored session once on mount.
  useEffect(() => {
    let active = true;

    async function restore() {
      const savedToken = authStorage.getToken();
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (active) {
          setUser(currentUser);
          authStorage.set(savedToken, currentUser);
        }
      } catch {
        // Token is invalid or expired — drop the whole session.
        if (active) {
          authStorage.clear();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restore();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { token: nextToken, user: nextUser } = await authService.login(credentials);
    authStorage.set(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: nextUser } = await authService.register(payload);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth store; throws if used outside <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
