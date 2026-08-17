import React from 'react';

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

const DropdownItem = ({ notification, onMarkAsRead }) => {
  const isUnread = notification.status === 'Unread';

  // 1. Determine Icon and Colors STRICTLY based on real API type field
  // FIX: We now assign raw JSX elements to this variable instead of an arrow function
  let iconElement; 
  let bgColorClass;
  let iconColorClass;

  if (notification.type?.includes('application')) {
    // Application types -> Blue User Icon
    bgColorClass = 'bg-blue-50';
    iconColorClass = 'text-[#2563EB]'; // Recruitment Blue
    iconElement = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  } else if (notification.type?.includes('job')) {
    // Job approved/live types -> Green Check Icon
    bgColorClass = 'bg-green-50';
    iconColorClass = 'text-green-500';
    iconElement = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (notification.type?.includes('interview') || notification.type?.includes('system')) {
    // Interview/System reminders -> Yellow Clock Icon
    bgColorClass = 'bg-yellow-50';
    iconColorClass = 'text-yellow-500';
    iconElement = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else {
    // Default fallback (e.g., Reports) -> Blue Document Icon
    bgColorClass = 'bg-blue-50';
    iconColorClass = 'text-[#2563EB]';
    iconElement = (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative flex items-start gap-3 p-4 border-b border-[#E2E8F0] hover:bg-slate-50 cursor-pointer transition-colors ${
        isUnread ? 'bg-white' : 'bg-white/60 opacity-80' // Read items are slightly dimmed
      }`}
    >
      {/* Unread Blue Dot Indicator */}
      {isUnread && (
        <div className="absolute left-1.5 top-6 w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
      )}

      {/* Dynamic Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${bgColorClass} ${iconColorClass}`}>
        {/* FIX: Render the element variable directly */}
        {iconElement}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        <p className={`text-[13px] leading-[1.4] ${isUnread ? 'text-[#0F172A] font-medium' : 'text-[#475569]'}`}>
          {notification.message}
        </p>
        <p className="text-[12px] text-[#94A3B8] mt-1.5">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default DropdownItem;