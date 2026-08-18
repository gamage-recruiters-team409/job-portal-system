/**
 * @file ConfirmationModal.jsx
 * @description High-fidelity confirmation modal for destructive or important actions.
 * Upgraded to match the Manage Users modal design with gradient header, round checkbox, and structured consequences.
 * @module Common/Components
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Ban, Check, Lock, EyeOff } from 'lucide-react';

/* ─── ConfirmationModal ─────────────────────────────────────────────────────── */

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireCheckbox = false,
  checkboxLabel = 'I understand the administrative implications of this action.',
  isLoading = false,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  // Reset checkbox when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireCheckbox && !isChecked) return;
    onConfirm();
  };

  const isSuspendAction =
    title?.toLowerCase().includes('suspend') ||
    confirmText?.toLowerCase().includes('suspend');

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
            {description && (
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Consequences / Impact Callout for Suspend Actions */}
          {isSuspendAction && (
            <div className="bg-red-50/70 border border-red-100/90 rounded-2xl p-4.5 space-y-3.5 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={13} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Instant Delisting</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Job post is immediately hidden from the platform and search results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                  <EyeOff size={13} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Report Resolution</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    The report will be marked as resolved and administrative action is logged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Circular Acknowledgement Checkbox */}
          {requireCheckbox && (
            <div
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onClick={() => setIsChecked(!isChecked)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setIsChecked(!isChecked);
                }
              }}
              className="flex items-center gap-3 text-left group cursor-pointer select-none pt-1"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                  isChecked
                    ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-2xs'
                    : 'bg-white border-slate-300 group-hover:border-slate-400'
                }`}
              >
                {isChecked && <Check size={12} strokeWidth={3.5} />}
              </div>
              <span className="text-xs font-medium text-slate-600 leading-snug">
                {checkboxLabel}
              </span>
            </div>
          )}

          {/* Action Buttons with equal height and single-line text */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 px-4 bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap shadow-2xs inline-flex items-center justify-center"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || (requireCheckbox && !isChecked)}
              className="flex-1 h-12 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ban size={15} />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
