import { Outlet } from 'react-router-dom';
import PublicFooter from './PublicFooter';

/**
 * @file PublicLayout.jsx
 * @description Layout wrapper for public (non-authenticated) pages.
 * Provides `PublicFooter` (owned by Bimsara) at the bottom of every wrapped
 * public route. Does not add a top navigation — that is a separately owned
 * shared component managed by its own PR and owner.
 * @module Layouts/Public
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}

