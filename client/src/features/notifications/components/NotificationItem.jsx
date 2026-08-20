import React from 'react';
import { Trash2 } from 'lucide-react';

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

// Maps the REAL notification.type values (from the backend) to icon/color config.
// These are the only three types the backend currently creates — see
// notification.service.js's notifyApplicationSubmitted / notifyNewApplication /
// notifyApplicationStatusChange.
const TYPE_CONFIG = {
  application_submitted: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    label: 'Application',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    ),
  },
  new_application: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    label: 'Application',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  application_status_changed: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    label: 'Status update',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
};

const DEFAULT_CONFIG = {
  bg: 'bg-[#F1F5F9]',
  text: 'text-[#475569]',
  label: 'Notification',
  svg: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  ),
};

const getIconConfig = (type) => TYPE_CONFIG[type] || DEFAULT_CONFIG;

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const isUnread = notification.status === 'Unread';
  const iconConfig = getIconConfig(notification.type);
  const timeString = getRelativeTime(notification.createdAt);

  return (
    <div className="group flex items-start gap-4 p-5 border-b border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors last:border-b-0">
      <div className="pt-2 flex-shrink-0 w-2 flex justify-center">
        {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
      </div>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconConfig.bg} ${iconConfig.text}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          {iconConfig.svg}
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[14px] leading-relaxed ${isUnread ? 'text-[#0F172A] font-medium' : 'text-[#334155]'}`}
        >
          {notification.message}
        </p>

        <p className="text-[13px] text-[#64748B] mt-0.5">{iconConfig.label}</p>

        {isUnread && (
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => onMarkAsRead(notification._id)}
              className="text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-1.5 rounded-[6px] transition-colors"
            >
              Mark as read
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 pt-0.5">
        <span className="text-[12px] text-[#64748B] whitespace-nowrap">{timeString}</span>
        <button
          type="button"
          onClick={() => onDelete(notification._id)}
          aria-label="Delete notification"
          title="Delete notification"
          className="rounded-[6px] p-1.5 text-[#64748B] opacity-0 transition-opacity hover:bg-red-50 hover:text-[#DC2626] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
