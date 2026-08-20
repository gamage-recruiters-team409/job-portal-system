import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/common/TopNavbar.jsx';
import Sidebar, {
  EMPLOYER_NAV_ITEMS,
  JOB_SEEKER_NAV_ITEMS,
} from '../../components/layout/Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import notificationService from '../../services/notificationService.js';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown.jsx';
import PublicFooter from '../public/PublicFooter.jsx';

export default function AuthenticatedLayout({ children, navItems, showFooter = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Notification State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsError, setNotificationsError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const notificationButtonRef = useRef(null);
  const pendingMarkAsReadIds = useRef(new Set());

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- Fetch Notifications + real unread count safely on mount ---
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const [data, unread] = await Promise.all([
          notificationService.getNotifications(1, 5),
          notificationService.getUnreadCount(),
        ]);

        setNotifications(data.notifications || []);
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

  // --- Toggle Dropdown ---
  const handleNotificationsClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // --- Mark a single notification as read (real API call + state update) ---
  const handleMarkAsRead = async (id) => {
    // Ignore a click on a notification that already has a request in
    // flight — prevents duplicate PATCH calls (and a double-decremented
    // badge) from rapid repeated clicks on the same unread item.
    if (pendingMarkAsReadIds.current.has(id)) return;
    pendingMarkAsReadIds.current.add(id);

    setActionError(null);

    // Optimistic-safe: only touch state if the call actually succeeds,
    // so the UI never shows a "read" state that isn't true in the DB.
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, status: 'Read' } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setActionError('Unable to mark notification as read. Tap it again to retry.');
    } finally {
      pendingMarkAsReadIds.current.delete(id);
    }
  };

  // --- Mark all notifications as read (real API call + state update) ---
  const handleMarkAllAsRead = async () => {
    setActionError(null);

    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setActionError('Unable to mark all notifications as read. Try again.');
    }
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
        notificationCount={unreadCount}
        onNotificationsClick={handleNotificationsClick}
        notificationButtonRef={notificationButtonRef}
      />

      {/* Render the dropdown below the navbar */}
      <NotificationDropdown
        isOpen={isDropdownOpen}
        notifications={notifications}
        error={notificationsError}
        onClose={() => setIsDropdownOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        triggerRef={notificationButtonRef}
        actionError={actionError}
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
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="flex-1">{children || <Outlet />}</div>
          {showFooter && <PublicFooter />}
        </main>
      </div>
    </div>
  );
}

// Alias export for compatibility
export { AuthenticatedLayout as EmployerLayout };
