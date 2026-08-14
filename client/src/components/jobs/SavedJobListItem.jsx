import { Link } from 'react-router-dom';

/**
 * @file SavedJobListItem.jsx
 * @description Row/list view for a single saved job. Matches the
 * High-Fidelity UI Design list layout: logo/initial, title, company link,
 * saved date, and a bookmark icon to unsave.
 */
export default function SavedJobListItem({ item, onRemove }) {
  const { job, isAvailable, unavailableReason, savedAt } = item;
  const companyName = job?.companyId?.companyName ?? 'Company';

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700">
          {companyName.charAt(0)}
        </span>

        {isAvailable ? (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              to={`/jobs/${job._id}`}
              className="truncate font-semibold text-slate-900 hover:text-blue-700"
            >
              {job.title}
            </Link>
            <span className="text-slate-300">•</span>
            <span className="truncate text-slate-500">{companyName}</span>
          </div>
        ) : (
          <span className="truncate text-sm text-slate-400">{unavailableReason}</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-xs text-slate-400">{formatDate(savedAt)}</span>
        <button
          type="button"
          onClick={() => onRemove(item.jobId ?? item.job?._id)}
          aria-label="Remove from saved jobs"
          className="text-slate-400 transition-colors hover:text-blue-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2a1 1 0 0 0-1 1v18l7-4.5 7 4.5V3a1 1 0 0 0-1-1H6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}