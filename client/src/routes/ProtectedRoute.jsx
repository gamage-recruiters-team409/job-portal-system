import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Guards a route behind an authenticated session and, optionally, a set of
 * allowed roles.
 *
 * Props:
 *   children     – the route element to render when access is granted.
 *   allowedRoles – optional string array of roles permitted to view the route
 *                  (e.g. ['admin'] or ['employer', 'admin']). When omitted,
 *                  any authenticated user is permitted.
 *
 * Redirect behaviour:
 *   • Not authenticated  → /login
 *   • Wrong role         → /unauthorized
 *
 * While the session is being restored on first load it shows a lightweight
 * placeholder so protected pages do not flash the login screen.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
