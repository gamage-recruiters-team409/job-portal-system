import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import NotificationItem from '../components/NotificationItem.jsx';
import EmptyNotificationState from '../components/EmptyNotificationState.jsx';
import notificationService from '../../../services/notificationService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { USER_ROLES } from '../../../constants/statuses.js';

// Maps the tab labels users see to the real notification.type value the
// backend accepts. The backend only accepts ONE type per request, so
// "Application" resolves to a single, role-aware type.
function getTypeForTab(tab, role) {
  if (tab === 'Application') {
    return role === USER_ROLES.EMPLOYER ? 'new_application' : 'application_submitted';
  }
  if (tab === 'Status') {
    return 'application_status_changed';
  }
  return undefined; // 'All' — no type filter
}

const TABS = ['All', 'Application', 'Status'];

export default function NotificationCenterPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Non-fatal — badge just won't update this cycle.
      console.error('Failed to load unread count:', err);
    }
  }, []);

  const fetchNotifications = useCallback(
    async (page = 1, isRetry = false) => {
      try {
        if (isRetry) setLoading(true);
        setError(null);
        const type = getTypeForTab(activeTab, user?.role);

        let targetPage = page;
        let result = await notificationService.getNotifications(targetPage, 10, {
          type,
          unreadOnly,
        });

        // If the mutation shrank the filtered set, the page we asked for
        // may no longer exist — fall back to the new last valid page.
        if (result.pagination.totalPages > 0 && targetPage > result.pagination.totalPages) {
          targetPage = result.pagination.totalPages;
          result = await notificationService.getNotifications(targetPage, 10, {
            type,
            unreadOnly,
          });
        }

        setNotifications(result.notifications);
        setPagination(result.pagination);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications([]);
        setError("We couldn't load your notifications right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, unreadOnly, user]
  );

  // Refetch from page 1 whenever the tab or unread filter changes.
  useEffect(() => {
    (async () => {
      await fetchNotifications(1);
    })();
  }, [fetchNotifications]);

  useEffect(() => {
    (async () => {
      await refreshUnreadCount();
    })();
  }, [refreshUnreadCount]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await Promise.all([fetchNotifications(pagination.page), refreshUnreadCount()]);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      await fetchNotifications(pagination.page);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchNotifications(newPage);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="mb-1 text-[13px] text-[#475569]">
          <span>Notifications</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-[#2563EB]">Notification center</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0F172A]">Notification Center</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[12px] font-semibold text-[#2563EB]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[14px] text-[#475569]">
              All updates about your jobs, applicants and account activity
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#F8FAFC]"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-[8px] bg-[#F1F5F9] p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setUnreadOnly(!unreadOnly)}
          className={`inline-flex items-center gap-2 rounded-[8px] border px-4 py-2 text-[13px] font-medium shadow-sm transition-colors ${
            unreadOnly
              ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]'
              : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Error Banner OR List / Empty State / Loading — never both */}
      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchNotifications(pagination.page, true)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-[14px] text-[#64748B]">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <EmptyNotificationState
          variant={activeTab === 'All' && !unreadOnly ? 'empty' : 'filter'}
          onAction={() => {
            if (activeTab === 'All' && !unreadOnly) {
              fetchNotifications(pagination.page, true);
            } else {
              setActiveTab('All');
              setUnreadOnly(false);
            }
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-sm">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer — only shown when there's more than one page of REAL data */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E2E8F0] pt-4 sm:flex-row">
          <p className="text-[13px] text-[#64748B]">
            Page {pagination.page} of {pagination.totalPages} — {pagination.total} total
            notifications
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-[6px] bg-[#2563EB] px-3 text-[13px] font-medium text-white">
              {pagination.page}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
