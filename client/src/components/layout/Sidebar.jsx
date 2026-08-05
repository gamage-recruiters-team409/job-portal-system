import { useState, useEffect, isValidElement } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ─── Default SVG icons (used only when callers don't supply their own) ──── */

function MenuIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

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

function DefaultBrandLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
 * @param {Object} props
 * @param {Array<{ label: string, icon: any, path: string }>} props.navItems
 * @param {React.ReactNode} [props.brand] - Brand logo / identity element
 * @param {Function} [props.onLogout] - Logout handler (button hidden when absent)
 */
function Sidebar({ navItems = [], brand, onLogout }) {
  const location = useLocation();

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /** Is the given path active? */
  function isActive(path) {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  return (
    <>
      {/* ── Mobile hamburger button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#475569] shadow-sm hover:bg-[#F8FAFC] md:hidden"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#E2E8F0] bg-white font-[Inter,ui-sans-serif,system-ui,sans-serif] transition-transform duration-300 ease-in-out',
          'md:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* ── Brand header ───────────────────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center border-b border-[#E2E8F0] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {brand || (
              <>
                <DefaultBrandLogo />
                <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-[#0F172A]">
                  Job Portal
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Navigation items ───────────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
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
