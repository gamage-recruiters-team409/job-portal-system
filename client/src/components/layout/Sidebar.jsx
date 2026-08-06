import { useEffect, isValidElement } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ─── Default SVG icons (used only when callers don't supply their own) ──── */

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
 * @param {Array<{ label: string, icon: any, path: string }>} props.navItems
 * @param {Function} [props.onLogout] - Logout handler (button hidden when absent)
 * @param {boolean} [props.isOpen] - Mobile drawer open state, owned by the parent layout
 * @param {Function} [props.onClose] - Called to close the mobile drawer (overlay, nav click)
 */
function Sidebar({ navItems = [], onLogout, isOpen = false, onClose = () => {} }) {
  const location = useLocation();

  // Disable body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /** Is the given path active? */
  function isActive(path) {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
            const active = isActive(item.path);

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
