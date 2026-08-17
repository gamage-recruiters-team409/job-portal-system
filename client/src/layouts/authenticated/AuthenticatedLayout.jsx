import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/common/TopNavbar.jsx';
import Sidebar, {
  EMPLOYER_NAV_ITEMS,
  JOB_SEEKER_NAV_ITEMS,
} from '../../components/layout/Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import notificationService from '../../services/notificationService.js';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown.jsx';

export default function AuthenticatedLayout({ children, navItems }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- NEW: Notification State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsError, setNotificationsError] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- NEW: Fetch Notifications safely on mount using IIFE pattern ---
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const data = await notificationService.getNotifications(1, 5);
        const fetchedNotifications = data.notifications || [];
        
        setNotifications(fetchedNotifications);
        
        // Calculate exact unread count from the real API data
        const unread = fetchedNotifications.filter(n => n.status === 'Unread').length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotificationsError('Unable to load notifications.');
      }
    };

    if (user) {
      fetchInitialNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- NEW: Toggle Dropdown ---
  const handleNotificationsClick = () => {
    setIsDropdownOpen(prev => !prev);
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
        // --- NEW: Props passed to TopNavbar ---
        notificationCount={unreadCount}
        onNotificationsClick={handleNotificationsClick}
      />

      {/* --- NEW: Render the dropdown below the navbar --- */}
      <NotificationDropdown 
        isOpen={isDropdownOpen}
        notifications={notifications}
        error={notificationsError}
        onClose={() => setIsDropdownOpen(false)}
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
        {/* min-w-0 overrides the flex item's default min-width:auto — without
            it, wide content anywhere on a page can stretch main past the
            viewport instead of wrapping/scrolling within it (the classic
            "flex child won't shrink below its content" bug), which the
            overflow-hidden row above then clips instead of exposing. */}
        <main className="min-w-0 flex-1 overflow-y-auto">{children || <Outlet />}</main>
      </div>
    </div>
  );
}

// Alias export for compatibility
export { AuthenticatedLayout as EmployerLayout };