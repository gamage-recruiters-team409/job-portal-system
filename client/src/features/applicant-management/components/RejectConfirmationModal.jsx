import React, { useState } from 'react';
import { rejectApplicant } from '../../../services/applicantService.js';

export default function RejectConfirmationModal({
  applicationId,
  applicantName,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Body payload must use 'note' (Rule 3)
      await rejectApplicant(applicationId, { note: note.trim() });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to reject candidate. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header Content */}
        <div className="flex flex-col items-center text-center">
          {/* Red X Circle Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Reject Candidate</h2>

          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to reject{' '}
            <strong className="font-semibold text-red-600">
              {applicantName || 'this candidate'}
            </strong>{' '}
            for the{' '}
            <strong className="font-semibold text-gray-900">{jobTitle || 'selected'}</strong>{' '}
            position?
          </p>

          <p className="mt-1 text-xs text-gray-500">This action cannot be undone.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Reason Textarea Form */}
        <form onSubmit={handleConfirm} className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="rejectionReason"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Reason for rejection (Optional)
              </label>
              <span className="text-xs text-gray-400">{note.length}/1000</span>
            </div>
            <textarea
              id="rejectionReason"
              rows="3"
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter reason for rejection..."
              className="mt-2 w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-red-500 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:opacity-60"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-center gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Rejecting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Reject
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
