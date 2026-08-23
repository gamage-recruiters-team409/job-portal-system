/**
 * @file AdminTopbar.jsx
 * @description Top navigation bar component for the Admin Dashboard.
 * Includes admin console title, settings navigation, and authentication logout.
 * @module Admin/Layout
 */

import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SettingsIcon as Settings } from '../../components/common/AdminIcons.jsx';

const AdminTopbar = ({ onMenuClick }) => {
  const { logout } = useAuth();

  return (
    <header
      className={[
        'h-16 bg-white border-b border-slate-200 flex items-center',
        'justify-between px-4 md:px-6 shrink-0 z-40 relative',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={[
            'lg:hidden p-2 -ml-2 text-slate-600',
            'hover:bg-slate-100 rounded-lg transition-colors',
          ].join(' ')}
          aria-label="Open Menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">Admin Console</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/settings"
          title="Settings"
          className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 stroke-[1.5]" />
        </Link>
        <button
          onClick={logout}
          title="Log Out"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;

