/**
 * @file ConfirmationModal.jsx
 * @description Reusable confirmation modal for destructive or important actions.
 * @module Common/Components
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

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
  checkboxLabel,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={
          'bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex ' +
          'flex-col items-center p-8 text-center '
        }
      >
        {/* Icon */}
        <div
          className={
            'w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5 ' +
            'text-red-600 '
          }
        >
          <AlertTriangle size={28} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>

        {/* Description */}
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">{description}</p>

        {/* Checkbox (Optional) */}
        {requireCheckbox && (
          <label
            className={
              'flex items-start text-left gap-4 w-full mb-8 cursor-pointer ' +
              'bg-slate-50 p-4 rounded-xl border border-slate-100 '
            }
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className={
                'mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 ' +
                'focus:ring-red-500 bg-white '
              }
            />
            <span className="text-sm text-slate-700 leading-snug font-medium">{checkboxLabel}</span>
          </label>
        )}

        {/* Buttons */}
        <div className="flex w-full gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={
              'flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 ' +
              'font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 '
            }
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (requireCheckbox && !isChecked)}
            className={
              'flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium ' +
              'hover:bg-red-700 transition-colors disabled:opacity-50 flex ' +
              'items-center justify-center gap-2 '
            }
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
