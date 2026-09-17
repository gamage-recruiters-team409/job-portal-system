import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/common/TopNavbar.jsx';
import Sidebar, {
  EMPLOYER_NAV_ITEMS,
  JOB_SEEKER_NAV_ITEMS,
} from '../../components/layout/Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import notificationService from '../../services/notificationService.js';
import { connectSocket, disconnectSocket } from '../../services/socketClient.js';
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
  const pendingClearIds = useRef(new Set());
  // Cursor-based, not page-number-based — see handleLoadMoreNotifications
  // for why: a page number silently drifts (skips or duplicates) once
  // real-time inserts/deletes can change the underlying list between
  // fetches. A timestamp cursor doesn't have that problem.
  const oldestLoadedCreatedAtRef = useRef(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);

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

        const initialNotifications = data.notifications || [];
        setNotifications(initialNotifications);
        setUnreadCount(unread);
        oldestLoadedCreatedAtRef.current =
          initialNotifications[initialNotifications.length - 1]?.createdAt || null;
        setHasMoreNotifications(Boolean(data.pagination?.hasMore));
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotificationsError('Unable to load notifications.');
      }
    };

    if (user) {
      fetchInitialNotifications();
    }
  }, [user]);

  // --- Real-time: listen for new notifications over the existing
  // Socket.IO connection, so the list/badge update without a manual
  // refresh (per the QA recommendation). Silent update only — no toast.
  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();
    if (!socket) return;

    const handleNewNotification = ({ notification }) => {
      // Prepend without truncating — the list can now hold more than 5
      // items once the user has clicked "Load more", and a live arrival
      // shouldn't discard anything they've already loaded.
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      // Always tear the connection down on cleanup, not just on the
      // explicit logout button — this effect re-runs whenever `user`
      // changes, so this guarantees no authenticated socket survives
      // past the session/user it was created for.
      disconnectSocket();
    };
  }, [user]);

  const handleLogout = () => {
    disconnectSocket();
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

  const handleClear = async (id) => {
    if (pendingClearIds.current.has(id)) return;
    pendingClearIds.current.add(id);
    setActionError(null);
    const wasUnread =
      notifications.find((notification) => notification._id === id)?.status === 'Unread';

    try {
      try {
        await notificationService.deleteNotification(id);
      } catch (error) {
        console.error('Failed to clear notification:', error);
        setActionError('Unable to clear this notification. Try again.');
        return;
      }

      // Remove just the cleared item from the existing list, whatever
      // its current length — refetching page 1 here would silently
      // discard anything loaded via "Load more".
      setNotifications((prev) => prev.filter((item) => item._id !== id));

      try {
        const unread = await notificationService.getUnreadCount();
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to refresh unread count after clear:', error);
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } finally {
      pendingClearIds.current.delete(id);
    }
  };

  const handleClearAll = async () => {
    setActionError(null);

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      oldestLoadedCreatedAtRef.current = null;
      setHasMoreNotifications(false);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      setActionError('Unable to clear all notifications. Try again.');
    }
  };

  // --- Lazy-load older notifications into the dropdown (QA recommendation:
  // pagination within the dropdown for users with a high volume of
  // historical notifications).
  //
  // Uses a timestamp CURSOR (the createdAt of the oldest notification
  // currently shown), not a page number. This is what makes it resilient
  // to real-time inserts and deletes happening concurrently:
  //   - A WebSocket insertion always prepends something NEWER than any
  //     existing item, so it can never appear again in an "older than
  //     the cursor" fetch — no duplicates.
  //   - Deleting an item doesn't change the cursor's timestamp value, so
  //     the next fetch still resumes from exactly the right point — no
  //     skipped items, unlike a page-number's skip count silently
  //     drifting when the underlying list shrinks or grows.
  // Deduplication by _id is kept as a defensive second layer regardless.
  const handleLoadMoreNotifications = async () => {
    if (loadingMoreNotifications || !hasMoreNotifications || !oldestLoadedCreatedAtRef.current) {
      return;
    }
    setLoadingMoreNotifications(true);
    setActionError(null);

    try {
      const data = await notificationService.getNotifications(1, 5, {
        before: oldestLoadedCreatedAtRef.current,
      });
      const olderNotifications = data.notifications || [];

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const deduped = olderNotifications.filter((n) => !existingIds.has(n._id));
        return [...prev, ...deduped];
      });

      if (olderNotifications.length > 0) {
        oldestLoadedCreatedAtRef.current =
          olderNotifications[olderNotifications.length - 1].createdAt;
      }
      setHasMoreNotifications(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error('Failed to load more notifications:', error);
      setActionError('Unable to load more notifications. Try again.');
    } finally {
      setLoadingMoreNotifications(false);
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
        onClear={handleClear}
        onClearAll={handleClearAll}
        triggerRef={notificationButtonRef}
        actionError={actionError}
        hasMore={hasMoreNotifications}
        onLoadMore={handleLoadMoreNotifications}
        loadingMore={loadingMoreNotifications}
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
