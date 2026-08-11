import React, { useEffect, useState } from 'react';
import { X, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { submitReport } from '../../../../services/reportService.js';

const REPORT_REASONS = [
  'Fake or non-existent job',
  'Requests payment or personal financial info',
  'Misleading job details',
  'Discriminatory requirements',
  'Spam or duplicate posting',
  'Other',
];

const MAX_CHARS = 500;

const reportSchema = z.object({
  reason: z
    .string()
    .min(1, 'Please select a reason')
    .refine((value) => REPORT_REASONS.includes(value), {
      message: 'Invalid report reason',
    }),
  description: z
    .string()
    .max(MAX_CHARS, `Description cannot exceed ${MAX_CHARS} characters`)
    .optional(),
});

export default function ReportFakeJobModal({ isOpen, onClose, jobId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: '',
      description: '',
    },
  });

  const description = watch('description') || '';

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSubmitted(false);
      setSubmitError('');
    }
  }, [isOpen, reset]);

  const onSubmit = async (formData) => {
    setSubmitError('');

    if (!jobId) {
      setSubmitError('Unable to submit the report because the job ID is missing.');
      return;
    }

    try {
      await submitReport({
        jobId,
        reason: formData.reason,
        description: formData.description || undefined,
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to submit the report. Please try again.'
      );
    }
  };

  const handleClose = () => {
    reset();
    setSubmitted(false);
    setSubmitError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {submitted ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
              <CheckCircle2 size={35} className="text-white" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">Report Submitted Successfully</h2>

            <p className="mt-2 text-sm text-gray-500">
              Thank you for reporting this job. Our team will review it shortly.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Report Fake Job</h2>

              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-800">
                Reason for reporting <span className="text-red-500">*</span>
              </label>

              <div className="relative mt-2">
                <select
                  {...register('reason')}
                  className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm outline-none transition-colors focus:ring-2 ${
                    errors.reason
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                >
                  <option value="" disabled>
                    Select a reason
                  </option>

                  {REPORT_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-3 text-gray-400"
                />
              </div>

              {errors.reason && (
                <p className="mt-2 flex items-center gap-2 text-sm text-red-500">
                  <AlertTriangle size={14} />
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-800">
                Additional information (optional)
              </label>

              <textarea
                {...register('description')}
                rows="4"
                maxLength={MAX_CHARS}
                placeholder="Explain why you think this job is suspicious..."
                className={`mt-2 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
                  errors.description
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />

              <p className="text-right text-xs text-gray-400">
                {description.length} / {MAX_CHARS}
              </p>

              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {submitError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-lg border px-5 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
