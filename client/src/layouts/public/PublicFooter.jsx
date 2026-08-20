import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../constants/statuses.js';

/**
 * @file PublicFooter.jsx
 * @description Shared footer for the public (non-authenticated) pages.
 * Owned by Bimsara — matches the shared design system (Recruitment Blue,
 * slate neutrals, Inter). Ported from the reference JobPortal footer and
 * adapted to the Gamage Recruiters brand and routing.
 *
 * Also reused (via AuthenticatedLayout's showFooter prop) on authenticated
 * Employer pages — the "For Employers" links are swapped to the signed-in
 * destinations there so an already-authenticated Employer isn't sent back
 * through /register or /login.
 * @module Layouts/Public
 */

const LINK_COLOR = 'text-slate-500 transition-colors hover:text-blue-600';

export default function PublicFooter() {
  const { user, isAuthenticated } = useAuth();
  const isAuthenticatedEmployer = isAuthenticated && user?.role === USER_ROLES.EMPLOYER;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        {/* Brand */}
        <div>
          <p className="text-lg font-bold text-slate-900">
            Gamage <span className="text-blue-600">Recruiters</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Find your dream job and build your career with Gamage Recruiters.
          </p>
        </div>

        {/* For Job Seekers */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900">For Job Seekers</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className={LINK_COLOR} to="/jobs">
                Browse jobs
              </Link>
            </li>
            <li>
              <Link className={LINK_COLOR} to="/register">
                Create an account
              </Link>
            </li>
            <li>
              <Link className={LINK_COLOR} to="/login">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        {/* For Employers */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900">For Employers</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                className={LINK_COLOR}
                to={isAuthenticatedEmployer ? '/jobs/create' : '/register'}
              >
                Post a job
              </Link>
            </li>
            <li>
              <Link
                className={LINK_COLOR}
                to={isAuthenticatedEmployer ? '/applicants' : '/register'}
              >
                Manage applications
              </Link>
            </li>
            <li>
              {isAuthenticatedEmployer ? (
                <Link className={LINK_COLOR} to="/employer/dashboard">
                  Employer dashboard
                </Link>
              ) : (
                <Link className={LINK_COLOR} to="/login">
                  Employer sign in
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className={LINK_COLOR} to="/help">
                Help center
              </Link>
            </li>
            <li>
              <Link className={LINK_COLOR} to="/contact">
                Contact us
              </Link>
            </li>
            <li>
              <Link className={LINK_COLOR} to="/about">
                About us
              </Link>
            </li>
            <li>
              <Link className={LINK_COLOR} to="/faq">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Gamage Recruiters. All rights reserved.
      </div>
    </footer>
  );
}
