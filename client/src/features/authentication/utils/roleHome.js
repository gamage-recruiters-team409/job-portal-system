import { USER_ROLES } from '../../../constants/statuses.js';

/**
 * Map an authenticated user's role to their landing route.
 * Dashboards land in later sprints, so every role currently returns to the
 * shared landing page — extend the switch as the dashboard routes are built.
 */
export function roleHome(role) {
  switch (role) {
    case USER_ROLES.EMPLOYER:
    case USER_ROLES.ADMIN:
      return '/';
    case USER_ROLES.JOB_SEEKER:
    default:
      return '/';
  }
}
