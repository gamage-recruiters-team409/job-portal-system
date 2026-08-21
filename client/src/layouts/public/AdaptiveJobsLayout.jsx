import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../constants/statuses.js';
import AuthenticatedLayout from '../authenticated/AuthenticatedLayout.jsx';
import PublicLayout from './PublicLayout.jsx';

/**
 * @file AdaptiveJobsLayout.jsx
 * @description Adaptive layout wrapper for Public Job Discovery pages (/jobs, /jobs/:id).
 * - If the user is authenticated as a Job Seeker or Employer, renders inside AuthenticatedLayout
 *   with the left sidebar (Find Jobs active), top navbar, and public footer (showFooter=true).
 * - If the user is a guest (unauthenticated) or has another role (such as Admin), renders inside
 *   PublicLayout with the public header and footer.
 * Owned by Bimsara.
 * @module Layouts/Public
 */
export default function AdaptiveJobsLayout() {
  const { user, isAuthenticated } = useAuth();

  const isAdaptiveRole =
    isAuthenticated && (user?.role === USER_ROLES.JOB_SEEKER || user?.role === USER_ROLES.EMPLOYER);

  if (isAdaptiveRole) {
    return (
      <AuthenticatedLayout showFooter>
        <Outlet />
      </AuthenticatedLayout>
    );
  }

  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
