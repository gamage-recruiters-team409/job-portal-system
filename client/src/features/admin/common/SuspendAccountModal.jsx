/**
 * @file SuspendAccountModal.jsx
 * @description High-fidelity confirmation modal for suspending or deactivating accounts.
 * Matches UI specifications with consequences list and acknowledgement checkbox.
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Ban, EyeOff, Lock, Check } from 'lucide-react';

const SuspendAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User',
  actionType = 'suspended', // 'suspended' | 'inactive'
  isSubmitting = false,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSuspend = actionType === 'suspended';
  const title = isSuspend ? 'Suspend Account' : 'Deactivate Account';
  const confirmBtnText = isSuspend ? 'Confirm Suspension' : 'Confirm Deactivation';
  const cancelBtnText = 'Keep Account Active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-[490px] border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-150 bg-gradient-to-b from-red-50/50 via-white to-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Top Accent Bar: Light Red to Dark Red */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-400 via-red-500 to-red-700" />

        <div className="p-6 sm:p-7 space-y-5 text-center">
          {/* Top Warning Icon Badge with soft gradient */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-red-50 to-red-100/70 text-[#DC2626] border border-red-200/70 flex items-center justify-center mx-auto shadow-2xs">
            <AlertTriangle size={28} className="text-[#DC2626]" />
          </div>

          {/* Heading and Description */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
              You are about to {isSuspend ? 'suspend' : 'deactivate'}{' '}
              <strong className="text-slate-900 font-semibold">@{userName}</strong>. This
              action will immediately revoke all access rights.
            </p>
          </div>

          {/* Consequences / Impact Callout */}
          <div className="bg-red-50/70 border border-red-100/90 rounded-2xl p-4.5 space-y-3.5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Instant Lockout</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  User cannot log in or access any portal features.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                <EyeOff size={13} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Profile Hidden</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  The public profile and active job applications will be delisted.
                </p>
              </div>
            </div>
          </div>

          {/* Round Acknowledgement Checkbox */}
          <div
            role="checkbox"
            aria-checked={acknowledged}
            tabIndex={0}
            onClick={() => setAcknowledged(!acknowledged)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setAcknowledged(!acknowledged);
              }
            }}
            className="flex items-center gap-3 text-left group cursor-pointer select-none pt-1"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                acknowledged
                  ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-2xs'
                  : 'bg-white border-slate-300 group-hover:border-slate-400'
              }`}
            >
              {acknowledged && <Check size={12} strokeWidth={3.5} />}
            </div>
            <span className="text-xs font-medium text-slate-600 leading-snug">
              I understand the administrative implications of this {isSuspend ? 'suspension' : 'deactivation'}.
            </span>
          </div>

          {/* Action Buttons with equal height and single-line text */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-12 px-4 bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap shadow-2xs inline-flex items-center justify-center"
            >
              {cancelBtnText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={!acknowledged || isSubmitting}
              className="flex-1 h-12 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Ban size={15} />
                  {confirmBtnText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspendAccountModal;
