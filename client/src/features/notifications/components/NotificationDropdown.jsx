import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../../components/common/ConfirmationModal.jsx';
import DropdownItem from './DropdownItem.jsx';

const NotificationDropdown = ({
  isOpen,
  notifications,
  error,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClearAll,
  triggerRef,
  actionError,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const [clearAllConfirmation, setClearAllConfirmation] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target);
      const clickedTrigger = triggerRef?.current?.contains(event.target);
      const clickedInsideModal = modalRef.current?.contains(event.target);

      // Ignore clicks on the bell itself — its own onClick already
      // handles toggling open/closed, so closing here too would race
      // with that toggle and cause an open->close->reopen flicker.
      if (!clickedInsideDropdown && !clickedTrigger && !clickedInsideModal) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Reset portaled modal state whenever the dropdown closes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setClearAllConfirmation(false);
  }, [isOpen]);

  // If the dropdown isn't open, render nothing
  if (!isOpen) return null;

  const handleViewAll = () => {
    navigate('/notifications');
    onClose(); // Close the dropdown when navigating away
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await onClearAll();
      setClearAllConfirmation(false);
    } finally {
      setClearingAll(false);
    }
  };

  const hasUnread = notifications.some((n) => n.status === 'Unread');

  return (
    <div
      ref={dropdownRef}
      className="absolute right-6 top-16 w-[calc(100vw-3rem)] max-w-[380px] bg-white rounded-[14px] shadow-lg border border-[#E2E8F0] z-50 overflow-hidden"
    >
      {/* Decorative caret pointing to the bell icon */}
      <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-[#E2E8F0] transform rotate-45"></div>

      <div className="relative bg-white z-10">
        {/* 1. Header */}
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
          <h3 className="font-bold text-[16px] text-[#0F172A]">Notifications</h3>
          <div className="flex items-center gap-3">
            {hasUnread && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[13px] text-[#2563EB] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setClearAllConfirmation(true)}
                className="text-[13px] text-[#64748B] hover:text-[#0F172A] hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* 2. Tabs — only "All" is functional; Applications/Jobs/System removed
            until real backend type categories exist for them to filter on. */}
        <div className="flex gap-4 px-4 pt-2 border-b border-[#E2E8F0] text-[13px] font-medium text-[#64748B]">
          <button className="pb-2 text-[#2563EB] border-b-2 border-[#2563EB]">All</button>
        </div>

        {/* Action-error banner: shown ABOVE the list, never replaces it —
        unlike the load-error state below, the list is still valid
        here, only one action (mark read / mark all) failed. */}
        {actionError && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-red-600 text-[12px] font-medium">
            {actionError}
          </div>
        )}

        {/* 3. Body Container (Scrollable) */}
        <div className="max-h-[340px] overflow-y-auto bg-[#F8FAFC]">
          {error ? (
            // Genuine Error State
            <div className="p-6 text-center text-red-500 text-[13px] font-medium">{error}</div>
          ) : notifications.length === 0 ? (
            // Genuine Empty State
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <p className="text-[#64748B] text-[13px] font-medium mb-1">You're all caught up!</p>
              <p className="text-[#94A3B8] text-[12px]">No new notifications at the moment.</p>
            </div>
          ) : (
            // List Container
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <DropdownItem
                  key={notif._id}
                  notification={notif}
                  onMarkAsRead={onMarkAsRead}
                  onClear={onClear}
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

      <ConfirmationModal
        isOpen={clearAllConfirmation}
        onClose={() => {
          if (!clearingAll) setClearAllConfirmation(false);
        }}
        onConfirm={handleClearAll}
        ref={modalRef}
        title="Clear all notifications?"
        description="This will permanently remove ALL of your notifications, not just the notifications currently visible in this dropdown."
        confirmText="Clear All"
        isLoading={clearingAll}
      />
    </div>
  );
};

export default NotificationDropdown;
