import { USER_ROLES } from '../../../constants/statuses.js';

/**
 * Map an authenticated user's role to their landing route.
 * Employers land on the shared landing page; admins land on the Admin Console
 * (routing owned by Bimsara). Extend the switch as more dashboards are built.
 */
export function roleHome(role) {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.SUPERADMIN:
      return '/admin';
    case USER_ROLES.EMPLOYER:
    case USER_ROLES.JOB_SEEKER:
    default:
      return '/';
  }
}
