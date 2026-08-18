export default function SubmitForReviewModal({ jobTitle, onConfirm, onCancel, isSubmitting }) {
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
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-[#000000]">Submit for review?</h2>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          "{jobTitle}" will be sent to an admin for approval before it goes live. You won't be able
          to edit it while it's pending.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[#94A3B8] px-6 py-2 text-sm font-medium text-[#000000] hover:bg-[#94A3B8] disabled:opacity-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-medium text-white hover:bg-[#1E40AF] disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      </div>
    </div>
  );
}
