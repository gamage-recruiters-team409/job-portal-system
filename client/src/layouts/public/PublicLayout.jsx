import { Outlet, Link } from 'react-router-dom';
import PublicFooter from './PublicFooter';

/**
 * @file PublicLayout.jsx
 * @description Layout wrapper for public (non-authenticated) pages. Provides a
 * lightweight public top bar and the shared PublicFooter around the routed
 * content. Owned by Bimsara.
 * @module Layouts/Public
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Public top bar — kept minimal; does not expose the authenticated top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-lg font-bold text-slate-900">
            Gamage <span className="text-blue-600">Recruiters</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link to="/jobs" className="transition-colors hover:text-blue-600">
              Browse Jobs
            </Link>
            <Link to="/help" className="transition-colors hover:text-blue-600">
              Help
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
