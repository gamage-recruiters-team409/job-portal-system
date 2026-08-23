import React from 'react';
import { X } from 'lucide-react';

// Helper to format the real API ISO timestamp into "5 minutes ago", etc.
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
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
};

// Maps the REAL notification.type values to icon/color config.
// Kept in sync with the TYPE_CONFIG in NotificationItem.jsx (Notification Centre).
const TYPE_CONFIG = {
  application_submitted: {
    bg: 'bg-blue-50',
    text: 'text-[#2563EB]',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
  new_application: {
    bg: 'bg-green-50',
    text: 'text-green-500',
    svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
  },
  application_status_changed: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-500',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
};

const DEFAULT_CONFIG = {
  bg: 'bg-blue-50',
  text: 'text-[#2563EB]',
  svg: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  ),
};

const DropdownItem = ({ notification, onMarkAsRead, onClear }) => {
  const isUnread = notification.status === 'Unread';
  const {
    bg: bgColorClass,
    text: iconColorClass,
    svg,
  } = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-start gap-3 p-4 border-b border-[#E2E8F0] hover:bg-slate-50 cursor-pointer transition-colors ${
        isUnread ? 'bg-white' : 'bg-white/60 opacity-80'
      }`}
    >
      {isUnread && (
        <div className="absolute left-1.5 top-6 w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
      )}

      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${bgColorClass} ${iconColorClass}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {svg}
        </svg>
      </div>

      <div className="flex-1 min-w-0 pl-1">
        <p
          className={`text-[13px] leading-[1.4] ${isUnread ? 'text-[#0F172A] font-medium' : 'text-[#475569]'}`}
        >
          {notification.message}
        </p>
        <p className="text-[12px] text-[#94A3B8] mt-1.5">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClear(notification._id);
        }}
        aria-label="Clear notification"
        title="Clear notification"
        className="shrink-0 rounded-[6px] p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DropdownItem;
