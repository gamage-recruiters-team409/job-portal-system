import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/common/TopNavbar.jsx';
import Sidebar, {
  EMPLOYER_NAV_ITEMS,
  JOB_SEEKER_NAV_ITEMS,
} from '../../components/layout/Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthenticatedLayout({ children, navItems }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isEmployer = user?.role === 'employer';
  const selectedNavItems = navItems || (isEmployer ? EMPLOYER_NAV_ITEMS : JOB_SEEKER_NAV_ITEMS);

  const profilePath = isEmployer ? '/employer/company' : '/profile';
  const isProfileDisabled = selectedNavItems.some(
    (item) => item.path === profilePath && item.disabled
  );

  const displayName =
    user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <TopNavbar
        userName={displayName}
        userRole={isEmployer ? 'Employer' : 'Job Seeker'}
        avatarUrl={user?.avatar || user?.companyLogo}
        searchPlaceholder={isEmployer ? 'search applicants...' : 'search jobs...'}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        profilePath={profilePath}
        profileDisabled={isProfileDisabled}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          navItems={selectedNavItems}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto">{children || <Outlet />}</main>
      </div>
    </div>
  );
}

// Alias export for compatibility
export { AuthenticatedLayout as EmployerLayout };
