import { useState } from 'react';

/**
 * @file ApplyJobModal.jsx
 * @description Apply Job modal. Per backend PR #33 correction #2, the CV
 * is always derived server-side from the Job Seeker's approved profile —
 * this form intentionally has NO resume upload field. Only an optional
 * cover letter is collected here.
 */
export default function ApplyJobModal({ job, onClose, onSubmit, submitting, error }) {
  const [coverLetter, setCoverLetter] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(coverLetter.trim() || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Apply for: {job.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              at {job.companyId?.companyName ?? 'Company'}
              {job.location ? `, ${job.location}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="coverLetter" className="mb-1.5 block text-sm font-medium text-slate-700">
            Cover Letter (Optional)
          </label>
          <textarea
            id="coverLetter"
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            maxLength={3000}
            placeholder="Tell the employer why you're a great fit for this role..."
            className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <p className="mt-2 text-xs text-slate-400">
            Your most recently uploaded profile CV will be submitted with this application.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}