import React from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownItem from './DropdownItem.jsx';

const NotificationDropdown = ({ 
  isOpen, 
  notifications, 
  error, 
  onClose 
}) => {
  const navigate = useNavigate();

  // If the dropdown isn't open, render nothing
  if (!isOpen) return null;

  const handleViewAll = () => {
    navigate('/notifications');
    onClose(); // Close the dropdown when navigating away
  };

  return (
    <div className="absolute right-6 top-16 w-[380px] bg-white rounded-[14px] shadow-lg border border-[#E2E8F0] z-50 overflow-hidden">
      
      {/* Decorative caret pointing to the bell icon */}
      <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-[#E2E8F0] transform rotate-45"></div>
      
      <div className="relative bg-white z-10">
        {/* 1. Header */}
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
          <h3 className="font-bold text-[16px] text-[#0F172A]">Notifications</h3>
          {notifications.length > 0 && (
            <button className="text-[13px] text-[#2563EB] hover:underline font-medium">
              Mark all as read
            </button>
          )}
        </div>

        {/* 2. Tabs (Matching Figma) */}
        <div className="flex gap-4 px-4 pt-2 border-b border-[#E2E8F0] text-[13px] font-medium text-[#64748B]">
          <button className="pb-2 text-[#2563EB] border-b-2 border-[#2563EB]">All</button>
          <button className="pb-2 hover:text-[#0F172A]">Applications</button>
          <button className="pb-2 hover:text-[#0F172A]">Jobs</button>
          <button className="pb-2 hover:text-[#0F172A]">System</button>
        </div>

        {/* 3. Body Container (Scrollable) */}
        <div className="max-h-[340px] overflow-y-auto bg-[#F8FAFC]">
          {error ? (
            // Genuine Error State
            <div className="p-6 text-center text-red-500 text-[13px] font-medium">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            // Genuine Empty State
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <p className="text-[#64748B] text-[13px] font-medium mb-1">
                You're all caught up!
              </p>
              <p className="text-[#94A3B8] text-[12px]">
                No new notifications at the moment.
              </p>
            </div>
          ) : (
            // List Container
            // List Container
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <DropdownItem 
                  key={notif._id} 
                  notification={notif}
                  // We will wire this function up in the final step!
                  onMarkAsRead={(id) => console.log('Marking as read:', id)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-3 bg-white border-t border-[#E2E8F0] text-center">
          <button 
            onClick={handleViewAll}
            className="text-[#2563EB] text-[13px] font-medium hover:underline"
          >
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;