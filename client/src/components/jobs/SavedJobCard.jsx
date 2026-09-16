import { Link } from 'react-router-dom';

/**
 * @file SavedJobCard.jsx
 * @description Card view for a single saved job (grid layout).
 * Supports bulk-unsave selection mode. The checkbox is displayed
 * only when selection mode is active.
 */
export default function SavedJobCard({
  item,
  onRemove,
  isSelected,
  onToggleSelect,
  isSelectMode,
}) {
  const { job, isAvailable, unavailableReason, savedAt } = item;

  function timeAgo(dateString) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';

    return `${days} days ago`;
  }

  const jobId = item.jobId ?? item.job?._id;

  return (
    <div
      className={`relative rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
        isSelectMode && isSelected
          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
          : 'border-slate-200'
      }`}
    >
      {/* Selection Checkbox - Only visible in Select Mode */}
      {isSelectMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(jobId)}
          aria-label="Select job for bulk removal"
          className="absolute left-4 top-4 z-10 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      )}

      {/* Bookmark / Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(jobId)}
        aria-label="Remove from saved jobs"
        className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-blue-600"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 2a1 1 0 0 0-1 1v18l7-4.5 7 4.5V3a1 1 0 0 0-1-1H6z" />
        </svg>
      </button>

      {/* Job Content */}
      <div
        className={`flex items-start gap-4 ${
          isSelectMode ? 'pl-6' : ''
        } pr-8`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700">
          {isAvailable ? 'Logo' : '—'}
        </span>

        <div className="min-w-0 flex-1">
          {isAvailable ? (
            <Link to={`/jobs/${job._id}`} className="block">
              <h3 className="truncate text-base font-semibold text-slate-900 hover:text-blue-700">
                {job.title}
              </h3>

              <p className="truncate text-sm text-slate-500">
                {job.companyId?.companyName ?? 'Company'}
              </p>
            </Link>
          ) : (
            <>
              <h3 className="truncate text-base font-semibold text-slate-400">
                Job unavailable
              </h3>

              <p className="truncate text-sm text-slate-400">
                {unavailableReason}
              </p>
            </>
          )}

          <p className="mt-1 text-xs text-slate-400">
            Saved {timeAgo(savedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}