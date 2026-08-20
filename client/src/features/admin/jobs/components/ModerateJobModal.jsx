/**
 * @file ModerateJobModal.jsx
 * @description Modal for performing admin job moderation (publish, suspend, reject)
 * with mandatory review notes and live character counter validation.
 * Follows the Job Portal System UI Guidelines (Colors, Typography, Spacing, Buttons, and Badges).
 * @module Admin/Jobs/Components
 */

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  X,
  Briefcase,
  Building2,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';
import { JOB_STATUSES } from '../../../../constants/statuses';

const ACTION_CONFIG = {
  [JOB_STATUSES.PUBLISHED]: {
    title: 'Approve & Publish Job',
    subtitle: 'This will make the job listing publicly visible and searchable on the job board.',
    buttonText: 'Publish Job',
    buttonClass: 'bg-[#16A34A] hover:bg-green-700 focus:ring-green-500 text-white',
    icon: CheckCircle2,
    iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
    headerGradient: 'from-green-500 to-green-600',
  },
  [JOB_STATUSES.SUSPENDED]: {
    title: 'Suspend Job Listing',
    subtitle:
      'This will immediately delist the job from the public board and prevent new applications.',
    buttonText: 'Suspend Job',
    buttonClass: 'bg-[#DC2626] hover:bg-red-700 focus:ring-red-500 text-white',
    icon: ShieldAlert,
    iconBg: 'bg-[#FEE2E2] text-[#DC2626]',
    headerGradient: 'from-red-500 to-red-600',
  },
  [JOB_STATUSES.REJECTED]: {
    title: 'Reject Job Listing',
    subtitle:
      'This will mark the job as rejected due to policy violations or errors.',
    buttonText: 'Reject Job',
    buttonClass: 'bg-[#DC2626] hover:bg-red-700 focus:ring-red-500 text-white',
    icon: XCircle,
    iconBg: 'bg-[#FEE2E2] text-[#DC2626]',
    headerGradient: 'from-red-500 to-red-600',
  },
};

const ModerateJobModal = ({
  isOpen,
  onClose,
  onConfirm,
  job,
  targetStatus = JOB_STATUSES.PUBLISHED,
  isSubmitting = false,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const config = ACTION_CONFIG[targetStatus] || ACTION_CONFIG[JOB_STATUSES.PUBLISHED];
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviewNote('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reviewNote.trim();

    if (!trimmed) {
      setValidationError('Review note is required.');
      return;
    }

    if (trimmed.length < 10) {
      setValidationError(`Review note must be at least 10 characters long (${trimmed.length}/10).`);
      return;
    }

    if (trimmed.length > 500) {
      setValidationError(`Review note cannot exceed 500 characters (${trimmed.length}/500).`);
      return;
    }

    setValidationError('');
    onConfirm({ status: targetStatus, reviewNote: trimmed });
  };

  const charCount = reviewNote.trim().length;
  const isLengthValid = charCount >= 10 && charCount <= 500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header Gradient Top Bar */}
        <div className={`h-2.5 w-full bg-linear-to-r ${config.headerGradient}`} />

        <div className="p-6">
          {/* Top Row with Icon & Close Button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
              >
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{config.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Job Target Summary Box */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Job Posting</span>
                </div>
                <h4 className="mt-1 font-bold text-slate-900 text-sm break-words line-clamp-2">
                  {job.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {job.companyId?.companyName || 'Unknown Company'}
                  </span>
                </div>
              </div>

              {/* Status Transition Preview */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium self-start sm:self-center">
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-slate-700 capitalize">
                  {job.status?.replace('_', ' ') || 'unknown'}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-semibold text-white capitalize">
                  {targetStatus?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="reviewNote"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Internal Review Note <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Explain the reason for this action. This will be stored in the permanent audit
                trail.
              </p>

              <textarea
                id="reviewNote"
                rows={4}
                value={reviewNote}
                onChange={(e) => {
                  setReviewNote(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={isSubmitting}
                placeholder="E.g., Job posting verified against company requirements and approved for public listing."
                className={`mt-2 w-full rounded-xl border p-3 text-sm text-slate-900 placeholder-slate-400 shadow-2xs transition-all focus:outline-hidden focus:ring-1 ${
                  validationError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                } disabled:bg-slate-100 disabled:opacity-60`}
              />

              {/* Character count & Validation error */}
              <div className="mt-1.5 flex items-center justify-between text-xs">
                {validationError ? (
                  <p className="flex items-center gap-1 font-medium text-red-600">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    <span>{validationError}</span>
                  </p>
                ) : (
                  <span className="text-slate-400">Minimum 10 characters required</span>
                )}
                <span
                  className={`font-mono font-medium ${
                    charCount < 10
                      ? 'text-slate-400'
                      : charCount <= 500
                        ? 'text-[#16A34A]'
                        : 'text-[#DC2626]'
                  }`}
                >
                  {charCount}/500
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 w-full sm:w-auto min-w-[120px] rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isLengthValid}
                className={`h-11 w-full sm:w-auto min-w-[120px] flex items-center justify-center gap-2 rounded-xl text-sm font-medium shadow-xs transition-all focus:outline-hidden focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${config.buttonClass}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{config.buttonText}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModerateJobModal;
