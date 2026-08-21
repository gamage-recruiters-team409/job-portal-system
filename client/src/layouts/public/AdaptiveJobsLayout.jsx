import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthenticatedLayout from '../authenticated/AuthenticatedLayout.jsx';
import PublicLayout from './PublicLayout.jsx';

/**
 * @file AdaptiveJobsLayout.jsx
 * @description Adaptive layout wrapper for Public Job Discovery pages (/jobs, /jobs/:id).
 * - If the user is authenticated (Job Seeker or Employer), renders inside AuthenticatedLayout
 *   with the left sidebar (Find Jobs active), top navbar, and public footer (showFooter=true).
 * - If the user is a guest (unauthenticated), renders inside PublicLayout with the public header
 *   and footer.
 * Owned by Bimsara.
 * @module Layouts/Public
 */
export default function AdaptiveJobsLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
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
