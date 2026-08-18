/**
 * @file AdminTopbar.jsx
 * @description Top navigation bar component for the Admin Dashboard.
 * Includes search functionality, notifications, and settings per the UI Guidelines.
 * @module Admin/Layout
 */

import {
  SearchIcon as Search,
  MailIcon as Mail,
  SettingsIcon as Settings,
} from '../../components/common/AdminIcons.jsx';
const AdminTopbar = ({ onMenuClick }) => {
  return (
    <header
      className={[
        'h-16 bg-white border-b border-slate-200 flex items-center',
        'justify-between px-4 md:px-6 shrink-0 z-40 relative',
      ].join(' ')}
    >
      <div className="flex items-center gap-4 md:gap-8 flex-1">
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
        <h2 className="text-xl font-bold text-slate-800 hidden lg:block">Admin Console</h2>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative flex items-center">
          <Search className="absolute left-3 text-slate-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for jobs, users, or reports..."
            className={[
              'w-full pl-10 pr-4 py-2 text-sm bg-transparent',
              'outline-none placeholder-slate-400 text-slate-900',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button
          className={[
            'relative p-2 text-slate-600',
            'hover:bg-slate-100 rounded-full transition-colors',
          ].join(' ')}
        >
          <Mail className="w-6 h-6 stroke-[1.5]" />
          <span
            className={[
              'absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-white',
              'rounded-full border border-slate-600 flex items-center justify-center',
            ].join(' ')}
          >
            <span className="w-1 h-1 rounded-full border border-slate-600"></span>
          </span>
        </button>
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
