import React, { useState } from 'react';
import { shortlistApplicant } from '../../../services/applicantService.js';

export default function ShortlistConfirmationModal({
  applicationId,
  applicantName,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await shortlistApplicant(applicationId);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to shortlist candidate. Please try again.'
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

        {/* Content Centered */}
        <div className="flex flex-col items-center text-center">
          {/* Check Circle Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Shortlist Candidate</h2>

          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to shortlist{' '}
            <strong className="font-semibold text-blue-600">
              {applicantName || 'this candidate'}
            </strong>{' '}
            for the{' '}
            <strong className="font-semibold text-blue-600">{jobTitle || 'selected'}</strong>{' '}
            position?
          </p>

          {/* Info Box */}
          <div className="mt-5 flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-left text-sm text-emerald-900">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200/70 text-emerald-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span>
              The applicant status will be updated to{' '}
              <strong className="font-semibold text-emerald-950">&quot;Shortlisted&quot;</strong>.
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
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

          {/* Footer Action Buttons */}
          <div className="mt-6 flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
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
                  Shortlisting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Shortlist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
