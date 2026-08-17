import { JOB_STATUSES } from '../../../constants/statuses.js';

const STATUS_DOT_COLORS = {
  [JOB_STATUSES.DRAFT]: 'bg-[#94A3B8]',
  [JOB_STATUSES.PENDING_REVIEW]: 'bg-[#F59E0B]',
  [JOB_STATUSES.PUBLISHED]: 'bg-[#16A34A]',
  [JOB_STATUSES.CLOSED]: 'bg-[#64748B]',
  [JOB_STATUSES.SUSPENDED]: 'bg-[#DC2626]',
  [JOB_STATUSES.REJECTED]: 'bg-[#DC2626]',
};

const STATUS_HISTORY_LABELS = {
  [JOB_STATUSES.DRAFT]: 'Created as draft',
  [JOB_STATUSES.PENDING_REVIEW]: 'Submitted for review',
  [JOB_STATUSES.PUBLISHED]: 'Approved, now active',
  [JOB_STATUSES.CLOSED]: 'Closed',
  [JOB_STATUSES.SUSPENDED]: 'Suspended by admin',
  [JOB_STATUSES.REJECTED]: 'Rejected by admin',
};

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(deadline) {
  const diffMs = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

export default function JobStatusModal({ job, onClose, onEdit, onClosePosting }) {
  if (!job) return null;

  const daysRemaining = getDaysRemaining(job.deadline);
  const history = job.statusHistory || [];
  const canEdit = job.status === JOB_STATUSES.DRAFT || job.status === JOB_STATUSES.REJECTED;
  const canClosePosting = job.status === JOB_STATUSES.PUBLISHED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#000000]">{job.title}</h2>
            <span className="mt-1 inline-block rounded-full bg-[#DCFCE7] px-2 py-1 text-xs font-medium text-[#166534]">
              {job.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md m-1 border-[3px] border-[#94A3B8] text-[#94A3B8] hover:border-[#000000] hover:text-[#000000]"
          >
            <svg className="h-6 w-6 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">Applicants</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">—</p>
          </div>
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">Days remaining</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">{daysRemaining}</p>
          </div>
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">Views</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">{job.viewsCount ?? 0}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-[#000000]">Status history</p>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div key={index} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT_COLORS[entry.status] || 'bg-[#94A3B8]'}`}
                />
                <div>
                  <p className="text-sm font-medium text-[#000000]">
                    {STATUS_HISTORY_LABELS[entry.status] || entry.status}
                  </p>
                  <p className="text-xs text-[#64748B]">{formatDateTime(entry.changedAt)}</p>
                  {entry.note && <p className="text-xs text-[#64748B]">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-[#94A3B8] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#94A3B8]"
            >
              Edit
            </button>
          )}
          {canClosePosting && (
            <button
              type="button"
              onClick={onClosePosting}
              className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C]"
            >
              Close posting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
