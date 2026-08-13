import { useEffect, isValidElement } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ─── Default SVG Icons ─────────────────────────────────────────────────── */

function LogOutIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function DashboardIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BriefcaseIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function MessagesIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function BookmarkIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckSquareIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BuildingIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* ─── Shared Non-Admin Navigation Configurations ───────────────────────── */

// `disabled: true` marks destinations whose frontend route isn't registered
// in AppRoutes.jsx yet. Remove the flag once the owning module ships its route.
export const EMPLOYER_NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/employer/dashboard',
  },
  {
    label: 'Jobs',
    icon: BriefcaseIcon,
    path: '/jobs',
    disabled: true,
  },
  {
    label: 'Applicants',
    icon: UsersIcon,
    path: '/applicants',
    disabled: true,
  },
  {
    label: 'Company profile',
    icon: BuildingIcon,
    path: '/employer/company',
    altPaths: ['/company/profile'],
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    disabled: true,
  },
];

export const JOB_SEEKER_NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    disabled: true,
  },
  {
    label: 'My Profile',
    icon: UserIcon,
    path: '/profile',
    disabled: true,
  },
  {
    label: 'Find Jobs',
    icon: BriefcaseIcon,
    path: '/jobs',
    disabled: true,
  },
  {
    label: 'Messages',
    icon: MessagesIcon,
    path: '/messages',
    disabled: true,
  },
  {
    label: 'Saved Jobs',
    icon: BookmarkIcon,
    path: '/saved-jobs',
    disabled: true,
  },
  {
    label: 'My Applications',
    icon: CheckSquareIcon,
    path: '/applications',
    disabled: true,
  },
  {
    label: 'My reported jobs',
    icon: CheckSquareIcon,
    path: '/my-reported-jobs',
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    disabled: true,
  },
];

/* ─── Icon renderer ──────────────────────────────────────────────────────── */

function renderIcon(icon) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const IconComponent = icon;
  return <IconComponent className="h-5 w-5" />;
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

/**
 * Reusable sidebar navigation for non-admin dashboards.
 *
 * No brand/logo header — TopNavbar owns identity/branding at the top of the
 * page. This renders nav items and logout only.
 *
 * Mobile visibility is controlled by the parent authenticated layout, not by
 * internal state — this keeps a single source of truth shared with TopNavbar's
 * hamburger trigger (`onMenuClick` there should set `isOpen` true here).
 * Breakpoint is `lg` to match TopNavbar's `lg:hidden` menu button.
 *
 * @param {Object} props
 * @param {Array<{ label: string, icon: any, path: string, disabled?: boolean }>} [props.navItems]
 * @param {Function} [props.onLogout] - Logout handler (button hidden when absent)
 * @param {boolean} [props.isOpen] - Mobile drawer open state, owned by the parent layout
 * @param {Function} [props.onClose] - Called to close the mobile drawer (overlay, nav click)
 */
function Sidebar({ navItems = EMPLOYER_NAV_ITEMS, onLogout, isOpen = false, onClose = () => {} }) {
  const location = useLocation();

  // Disable body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /** Is the given nav item's path active? */
  function isActive(item) {
    const { path, altPaths } = item;
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    const allPaths = [path, ...(altPaths || [])];
    return allPaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));
  }

  return (
    <>
      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#E2E8F0] bg-white font-[Inter,ui-sans-serif,system-ui,sans-serif] transition-transform duration-300 ease-in-out',
          'lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* ── Navigation items ───────────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(item);

            // Not-yet-available destinations render as inert, visually muted
            // items so the sidebar never links to a page that 404s.
            if (item.disabled) {
              return (
                <span
                  key={item.path}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex h-[44px] cursor-not-allowed items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#CBD5E1]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {renderIcon(item.icon)}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={[
                  'flex h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center',
                    active ? 'text-[#2563EB]' : 'text-[#475569]',
                  ].join(' ')}
                >
                  {renderIcon(item.icon)}
                </span>

                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Logout button (only when handler provided) ─────────────── */}
        {onLogout && (
          <div className="shrink-0 border-t border-[#E2E8F0] p-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <LogOutIcon />
              </span>
              <span className="whitespace-nowrap">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
