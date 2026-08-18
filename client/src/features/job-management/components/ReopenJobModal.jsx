import { useState } from 'react';

export default function ReopenJobModal({ job, onConfirm, onCancel, isSubmitting, error }) {
  const [newDeadline, setNewDeadline] = useState('');
  const isExpired = new Date(job.deadline) < new Date();

  const formattedExistingDeadline = new Date(job.deadline).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleConfirm = () => {
    onConfirm(newDeadline || undefined);
  };

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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE]">
            <svg
              className="h-6 w-6 text-[#2563EB]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-[#000000]">
          Reopen this job opening?
        </h2>

        {isExpired ? (
          <p className="mt-2 text-center text-sm text-[#64748B]">
            This posting expired on {formattedExistingDeadline}. Set a new deadline to reopen it for
            applications.
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-[#64748B]">
            This posting's deadline is {formattedExistingDeadline}. Keep it, or choose a new
            deadline before reopening.
          </p>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-[#FEE2E2] px-4 py-2 text-center text-sm text-[#991B1B]">
            {error}
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-[#000000]">
            New application deadline{' '}
            {isExpired ? <span className="text-[#DC2626]">*</span> : '(optional)'}
          </label>
          <input
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="w-full rounded-lg border border-[#94A3B8] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
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
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-medium text-white hover:bg-[#1E40AF] disabled:opacity-50"
          >
            Reopen posting
          </button>
        </div>
      </div>
    </div>
  );
}
