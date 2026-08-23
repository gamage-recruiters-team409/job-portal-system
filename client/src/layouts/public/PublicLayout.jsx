import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, User, LogIn, UserPlus } from 'lucide-react';
import PublicFooter from './PublicFooter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../constants/statuses.js';

/**
 * @file PublicLayout.jsx
 * @description Layout wrapper for public (non-authenticated and guest) pages.
 * Provides a responsive Public Top Header with brand logo, nav links, auth buttons,
 * mobile hamburger drawer, and `PublicFooter` (owned by Bimsara) at the bottom.
 * @module Layouts/Public
 */
export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN;
  const isEmployer = user?.role === USER_ROLES.EMPLOYER;
  const isJobSeeker = user?.role === USER_ROLES.JOB_SEEKER;

  // Resolved profile/dashboard destinations per role.
  // Admin routes to the Admin Console (/admin, routing owned by Bimsara).
  // Never fall back to /jobs (a public page) for Admin — omit the link instead.
  const profilePath = isAdmin
    ? '/admin'
    : isJobSeeker
      ? '/profile'
      : isEmployer
        ? '/employer/company'
        : null;
  const displayName =
    user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isPathActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* ── Public Top Header Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Hamburger menu button (Mobile) + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 lg:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Briefcase size={20} />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Job <span className="text-blue-600">Portal</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isPathActive('/') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className={`text-sm font-semibold transition-colors ${
                isPathActive('/jobs') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Jobs
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                isPathActive('/about') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/support"
              className={`text-sm font-semibold transition-colors ${
                isPathActive('/support') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Support
            </Link>
          </nav>

          {/* Right: Auth Action Buttons or Profile Avatar
               Three distinct states:
               1. Authenticated + profilePath  → profile link (Job Seeker / Employer)
               2. Authenticated + no profilePath → nothing (Admin, no approved route yet)
               3. Not authenticated             → guest Sign In / Register controls
          */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              profilePath ? (
                <Link
                  to={profilePath}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  {user?.avatar || user?.companyLogo ? (
                    <img
                      src={user.avatar || user.companyLogo}
                      alt={displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {initials}
                    </span>
                  )}
                  <div className="hidden text-left text-xs sm:block">
                    <p className="font-bold text-slate-900">{displayName}</p>
                    <p className="text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </Link>
              ) : null
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:text-sm"
                >
                  <UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isPathActive('/')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User size={18} className="text-current" />
                <span>Home</span>
              </Link>

              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isPathActive('/jobs')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase size={18} />
                <span>Browse Jobs</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isPathActive('/about')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>About Us</span>
              </Link>

              <Link
                to="/support"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isPathActive('/support')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Support</span>
              </Link>

              {/* Mobile auth section — same three-state logic as desktop */}
              {isAuthenticated ? (
                profilePath ? (
                  <Link
                    to={profilePath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center gap-2.5 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-900"
                  >
                    <User size={18} className="text-blue-600" />
                    <span>Go to My Profile / Dashboard</span>
                  </Link>
                ) : null
              ) : (
                <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white"
                  >
                    <UserPlus size={16} />
                    <span>Register Account</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Main Public Content Area ────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Public Footer ─────────────────────────────────────────────────────── */}
      <PublicFooter />
    </div>
  );
}
