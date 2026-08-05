/**
 * @file AdminSidebar.jsx
 * @description Sidebar navigation component for the Admin Dashboard.
 * Implements the layout structure  and
 * MVP Baseline Scope (Section 5.10).
 * @module Admin/Layout
 */

import { NavLink } from 'react-router-dom';
import {
  DashboardIcon as LayoutGrid,
  UsersIcon as Users,
  EmployersIcon as Building2,
  JobsIcon as Briefcase,
  CategoriesIcon as Shapes,
  VerificationIcon as FileCheck,
  ModerationIcon as Shield,
  ImageIcon,
  ReportedIcon as AlertTriangle,
  NotificationIcon as Bell,
  StatisticsIcon as BarChart2,
  LogoIcon
} from '../../components/common/AdminIcons.jsx';

const AdminSidebar = () => {
  const sections = [
    {
      title: 'GENERAL',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Manage Employers', path: '/admin/employers', icon: Building2 },
      ]
    },
    {
      title: 'JOB BOARD',
      items: [
        { name: 'Manage Job Posts', path: '/admin/jobs', icon: Briefcase },
        { name: 'Categories & Skills', path: '/admin/categories', icon: Shapes },
        { name: 'Employer Verification', path: '/admin/verifications', icon: FileCheck },
        { name: 'Reported Jobs', path: '/admin/reported-jobs', icon: AlertTriangle }, // Added per analysis report
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Moderation Logs', path: '/admin/moderation-logs', icon: Shield },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell }, // Added per analysis report
        { name: 'Statistics', path: '/admin/statistics', icon: BarChart2 }, // Added per analysis report
      ]
    }
  ];

  return (
    <aside className="w-[280px] bg-[#F8FAFC] border-r border-slate-200 flex flex-col h-full">
      {/* Logo Area */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center">
            <LogoIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">
            Gamage<span className="text-[#2563EB]">Recruiters</span>
          </span>
        </div>
        <h1 className="text-[22px] font-bold text-slate-900 leading-tight">JobPortal Admin</h1>
        <p className="text-[13px] text-slate-500 mt-1 font-medium">System Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {sections.map((section, index) => (
          <div key={section.title} className={index > 0 ? 'mt-8' : 'mt-2'}>
            <h3 className="text-[11px] font-bold text-slate-500 mb-3 tracking-widest px-3">
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] font-medium ${isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-[18px] h-[18px]" />
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
      <div className="p-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-white border-2 border-slate-900 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/ProfileImg/Profile.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-slate-900 leading-tight">Sahan Viduranga</span>
            <span className="text-[12px] text-slate-500 font-medium">System Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
