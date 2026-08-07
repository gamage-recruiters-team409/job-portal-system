import React, { useState } from 'react';
import { X, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REPORT_REASONS = [
  'Fake or non-existent job',
  'Requests payment or personal financial info',
  'Misleading job details',
  'Discriminatory requirements',
  'Spam or duplicate posting',
  'Other',
];

const MAX_CHARS = 500;

export default function ReportFakeJobModal({ isOpen, onClose }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [showError, setShowError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason) {
      setShowError(true);
      return;
    }

    setShowError(false);

    // Backend API call will be added later
    console.log({
      reason,
      details,
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setShowError(false);
    setSubmitted(false);
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
              onClick={handleClose}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Report Fake Job</h2>

              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-800">
                Reason for reporting <span className="text-red-500">*</span>
              </label>

              <div className="relative mt-2">
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setShowError(false);
                  }}

                  className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm outline-none transition-colors focus:ring-2 ${
                    showError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                >
                  <option value="" disabled>
                    Select a reason
                  </option>

                  {REPORT_REASONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-3 text-gray-400"
                />
              </div>

              {showError && (
                <p className="mt-2 flex items-center gap-2 text-sm text-red-500">
                  <AlertTriangle size={14} />
                  Please select a reason
                </p>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-800">
                Additional information (optional)
              </label>

              <textarea
                rows="4"

                maxLength={MAX_CHARS}

                value={details}

                onChange={(e) => setDetails(e.target.value)}

                placeholder="Explain why you think this job is suspicious..."

                className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="text-right text-xs text-gray-400">
                {details.length} / {MAX_CHARS}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClose}

                className="rounded-lg border px-5 py-2 text-sm text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}

                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
