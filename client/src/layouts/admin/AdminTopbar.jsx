/**
 * @file AdminTopbar.jsx
 * @description Top navigation bar component for the Admin Dashboard.
 * Includes notification link, settings navigation, and quick logout.
 * @module Admin/Layout
 */

import { useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminTopbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={[
        'h-16 bg-white border-b border-slate-200 flex items-center',
        'justify-between px-4 md:px-6 shrink-0 z-40 relative',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
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

        <div className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">Admin Console</h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            System Secure
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          title="Notification Center"
          aria-label="Notifications"
          className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/admin/settings')}
          title="Admin Settings"
          aria-label="Settings"
          className="p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 stroke-[1.75]" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Info & Quick Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-blue-200 shadow-2xs">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-none">Super Admin</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
