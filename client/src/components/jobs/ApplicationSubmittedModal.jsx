import { Link } from 'react-router-dom';

export default function ApplicationSubmittedModal({ job, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-slate-900">Application submitted!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your application for {job.title} has been sent to {job.companyId?.companyName ?? 'the employer'}
        </p>

        <Link
          to="/my-applications"
          className="mt-5 block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          View Application
        </Link>
      </div>
    </div>
  );
}