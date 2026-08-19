export default function DeleteJobModal({
  jobTitle,
  allowed,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onCancel}
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
          Delete this job posting?
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          "{jobTitle}" will be removed from your job listings. The record is retained internally for
          history, but there is currently no way to restore it through the application.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-[#FEE2E2] px-4 py-2 text-center text-sm text-[#991B1B]">
            {error}
          </div>
        )}

        {!allowed && (
          <div className="mt-4 rounded-lg bg-[#FEE2E2] px-4 py-3 text-center text-sm text-[#991B1B]">
            Only available for draft, closed, and rejected postings. Active postings must be closed
            first.
          </div>
        )}

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
            onClick={onConfirm}
            disabled={isSubmitting || !allowed}
            className="rounded-lg bg-[#DC2626] px-6 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] disabled:opacity-50"
          >
            Delete posting
          </button>
        </div>
      </div>
    </div>
  );
}
