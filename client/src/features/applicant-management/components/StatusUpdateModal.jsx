import React, { useState, useEffect } from 'react';
import { APPLICATION_STATUSES } from '../../../constants/statuses.js';
import { updateApplicantStatus } from '../../../services/applicantService.js';

// Status labels & styles matching STATUS_CONFIG in ApplicantList/ApplicantDetails
const STATUS_CONFIG = {
  [APPLICATION_STATUSES.APPLIED]: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.SHORTLISTED]: {
    label: 'Shortlisted',
    badge: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.SELECTED]: {
    label: 'Selected',
    badge: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  [APPLICATION_STATUSES.WITHDRAWN]: {
    label: 'Withdrawn',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
};

// 4-step forward stepper order (Rule 6a)
const STEPPER_STEPS = [
  { key: APPLICATION_STATUSES.APPLIED, label: 'Pending' },
  { key: APPLICATION_STATUSES.UNDER_REVIEW, label: 'Under Review' },
  { key: APPLICATION_STATUSES.SHORTLISTED, label: 'Shortlisted' },
  { key: APPLICATION_STATUSES.SELECTED, label: 'Selected' },
];

const EMPLOYER_SETTABLE_STATUSES = [
  { key: APPLICATION_STATUSES.UNDER_REVIEW, label: 'Under Review' },
  { key: APPLICATION_STATUSES.SHORTLISTED, label: 'Shortlisted' },
  { key: APPLICATION_STATUSES.SELECTED, label: 'Selected' },
  { key: APPLICATION_STATUSES.REJECTED, label: 'Rejected' },
];

export default function StatusUpdateModal({
  applicationId,
  applicantName,
  jobTitle,
  currentStatus,
  appliedDate,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Available options: exclude current status (Rule 4)
  const availableOptions = EMPLOYER_SETTABLE_STATUSES.filter(
    (opt) => opt.key !== currentStatus
  );

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setNote('');
      setIsSubmitting(false);
      // Default to first available option
      if (availableOptions.length > 0) {
        setSelectedStatus(availableOptions[0].key);
      }
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const currentCfg = STATUS_CONFIG[currentStatus] ?? {
    label: currentStatus,
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };

  const isOutsideStepper =
    currentStatus === APPLICATION_STATUSES.REJECTED ||
    currentStatus === APPLICATION_STATUSES.WITHDRAWN;

  const isTargetRejected = selectedStatus === APPLICATION_STATUSES.REJECTED;

  // Determine stepper target step highlight
  const targetStepIndex = STEPPER_STEPS.findIndex((s) => s.key === selectedStatus);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError('Please select a new status.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateApplicantStatus(applicationId, {
        status: selectedStatus,
        note: note.trim(),
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update application status. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = appliedDate
    ? new Date(appliedDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Update Applicant Status</h2>
              <p className="text-sm text-gray-500">
                Update the application status and add optional comments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
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
        </div>

        {/* Info Banner */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>
            <strong className="font-semibold text-gray-900">{applicantName || 'Applicant'}</strong> applied for{' '}
            <strong className="font-semibold text-blue-600">{jobTitle || 'Job'}</strong> position
            {formattedDate ? ` on ${formattedDate}` : ''}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Status Select Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Current Status Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Current Status
              </label>
              <div className="mt-2 flex h-[50px] items-center rounded-xl border border-amber-200/70 bg-amber-50/50 px-4">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${currentCfg.badge.split(' ')[1]}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${currentCfg.dot}`} />
                  {currentCfg.label}
                </span>
              </div>
            </div>

            {/* New Status Select Dropdown */}
            <div>
              <label htmlFor="newStatusSelect" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                New Status <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <select
                  id="newStatusSelect"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isSubmitting || availableOptions.length === 0}
                  className="h-[50px] w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:opacity-60"
                >
                  {availableOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Status Progress Section (Rule 6a & 6b) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status Progress
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {isOutsideStepper && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentCfg.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentCfg.dot}`} />
                    Current: {currentCfg.label}
                  </span>
                )}
                {isTargetRejected && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[APPLICATION_STATUSES.REJECTED].badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[APPLICATION_STATUSES.REJECTED].dot}`} />
                    Will be marked: Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="mt-4 px-2">
              <div className="flex items-center justify-between">
                {STEPPER_STEPS.map((step, idx) => {
                  let isCompleted = false;
                  let isTarget = false;

                  if (!isOutsideStepper && targetStepIndex >= 0) {
                    if (idx < targetStepIndex) {
                      isCompleted = true;
                    } else if (idx === targetStepIndex) {
                      isTarget = true;
                    }
                  }

                  return (
                    <React.Fragment key={step.key}>
                      {/* Step Circle */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                            isCompleted
                              ? 'bg-blue-600 text-white'
                              : isTarget
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : 'border-2 border-gray-300 bg-white text-gray-400'
                          }`}
                        >
                          {isCompleted || isTarget ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium text-center ${
                            isCompleted
                              ? 'text-blue-700 font-semibold'
                              : isTarget
                              ? 'text-emerald-700 font-bold'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {/* Connecting Line (except last step) */}
                      {idx < STEPPER_STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mb-6 transition-all ${
                            idx < targetStepIndex && !isOutsideStepper
                              ? 'bg-blue-600'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comments Textarea */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="commentsNote" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Comments (Optional)
              </label>
              <span className="text-xs text-gray-400">
                {note.length}/1000
              </span>
            </div>
            <textarea
              id="commentsNote"
              rows="3"
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="Add comments about this status update..."
              className="mt-2 w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:opacity-60"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableOptions.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
