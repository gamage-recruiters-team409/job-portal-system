import { useState } from 'react';

const CLOSE_REASONS = [
  'Position filled',
  'No longer hiring for this role',
  'Budget changes',
  'Other',
];

export default function CloseJobModal({ jobTitle, onConfirm, onCancel, isSubmitting }) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[440px] rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]">
            <svg
              className="h-6 w-6 text-[#DC2626]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-[#000000]">
          Close this job opening?
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          "{jobTitle}" will stop accepting new applications. Existing applications stay visible.
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-[#000000]">Reason (optional)</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-[#94A3B8] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">Select Reason</option>
            {CLOSE_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[#94A3B8] px-6 py-2 text-sm font-medium text-[#000000] hover:bg-[#94A3B8] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            disabled={isSubmitting}
            className="rounded-lg bg-[#DC2626] px-6 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] disabled:opacity-50"
          >
            Close posting
          </button>
        </div>
      </div>
    </div>
  );
}
