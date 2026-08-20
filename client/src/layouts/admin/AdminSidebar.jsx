/**
 * @file AdminSidebar.jsx
 * @description Sidebar navigation component for the Admin Dashboard.
 * Implements the layout structure and MVP Baseline Scope (Section 5.10).
 * @module Admin/Layout
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  DashboardIcon as LayoutGrid,
  UsersIcon as Users,
  JobsIcon as Briefcase,
  CategoriesIcon as Shapes,
  VerificationIcon as FileCheck,
  ImageIcon,
  ReportedIcon as AlertTriangle,
  LogoIcon,
} from '../../components/common/AdminIcons.jsx';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const sections = [
    {
      title: 'GENERAL',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
        { name: 'User Management', path: '/admin/users', icon: Users },
      ],
    },
    {
      title: 'JOB BOARD',
      items: [
        { name: 'Manage Job Posts', path: '/admin/jobs', icon: Briefcase },
        { name: 'Categories & Skills', path: '/admin/categories', icon: Shapes },
        { name: 'Employer Verification', path: '/admin/employers', icon: FileCheck },
        { name: 'Reported Jobs', path: '/admin/reported-jobs', icon: AlertTriangle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile & Tablet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-full w-[280px]',
          'transform flex-col border-r border-slate-200 bg-[#F8FAFC]',
          'transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo Area */}
        <div className="shrink-0 p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB]">
              <LogoIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Gamage<span className="text-[#2563EB]">Recruiters</span>
            </span>
          </div>
          <h1 className="text-[22px] font-bold leading-tight text-slate-900">JobPortal Admin</h1>
          <p className="mt-1 text-[13px] font-medium text-slate-500">System Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          {sections.map((section, index) => (
            <div key={section.title} className={index > 0 ? 'mt-8' : 'mt-2'}>
              <h3 className="mb-3 px-3 text-[11px] font-bold tracking-widest text-slate-500">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        end={item.path === '/admin'}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 rounded-lg px-3 py-2.5',
                            'text-[14px] font-medium transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                          ].join(' ')
                        }
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="shrink-0 p-5">
          <div className="flex items-center gap-3">
            <div
              className={[
                'flex h-[42px] w-[42px] items-center justify-center overflow-hidden',
                'rounded-full border-2 border-slate-200 bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold leading-tight text-slate-900">
                {user?.name || user?.email || 'Admin User'}
              </span>
              <span className="text-[12px] font-medium text-slate-500">System Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

