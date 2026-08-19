import { JOB_STATUSES } from '../../../constants/statuses.js';
import { useEffect, useState } from 'react';
import { getApplicants } from '../../../services/applicantService.js';

const STATUS_LABELS = {
  [JOB_STATUSES.DRAFT]: 'Draft',
  [JOB_STATUSES.PENDING_REVIEW]: 'Pending review',
  [JOB_STATUSES.PUBLISHED]: 'Active',
  [JOB_STATUSES.CLOSED]: 'Closed',
  [JOB_STATUSES.SUSPENDED]: 'Suspended',
  [JOB_STATUSES.REJECTED]: 'Rejected',
};

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
  [JOB_STATUSES.CLOSED]: 'Closed',
  [JOB_STATUSES.SUSPENDED]: 'Suspended by admin',
  [JOB_STATUSES.REJECTED]: 'Rejected by admin',
};

function getHistoryLabel(entry, index, history) {
  if (entry.status !== JOB_STATUSES.PUBLISHED) {
    return STATUS_HISTORY_LABELS[entry.status] || entry.status;
  }

  const previousEntry = history[index - 1];
  if (previousEntry?.status === JOB_STATUSES.CLOSED) {
    return 'Reopened, now active';
  }
  if (previousEntry?.status === JOB_STATUSES.PENDING_REVIEW) {
    return 'Approved, now active';
  }
  return 'Published / Active';
}

const STATUS_BADGE_STYLES = {
  [JOB_STATUSES.DRAFT]: 'bg-[#F1F5F9] text-[#475569]',
  [JOB_STATUSES.PENDING_REVIEW]: 'bg-[#FEF3C7] text-[#92400E]',
  [JOB_STATUSES.PUBLISHED]: 'bg-[#DCFCE7] text-[#166534]',
  [JOB_STATUSES.CLOSED]: 'bg-[#F1F5F9] text-[#475569]',
  [JOB_STATUSES.SUSPENDED]: 'bg-[#FEE2E2] text-[#991B1B]',
  [JOB_STATUSES.REJECTED]: 'bg-[#FEE2E2] text-[#991B1B]',
};

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDeadlineInfo(job) {
  const diffMs = new Date(job.deadline).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (job.status === JOB_STATUSES.PUBLISHED) {
    return { label: 'Days Remaining', value: days > 0 ? days : 0 };
  }

  return { label: 'Days to Deadline', value: days > 0 ? days : 'Passed' };
}

export default function JobStatusModal({ job, onClose, onEdit, onClosePosting }) {
  const [applicantCount, setApplicantCount] = useState(null);

  useEffect(() => {
    if (!job) return;
    let isCancelled = false;

    getApplicants({ jobId: job._id, limit: 1 })
      .then((response) => {
        if (!isCancelled) {
          setApplicantCount(response.data.pagination?.total ?? 0);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setApplicantCount(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [job]);

  if (!job) return null;

  const deadlineInfo = getDeadlineInfo(job);
  const history = job.statusHistory || [];
  const canEdit = job.status === JOB_STATUSES.DRAFT || job.status === JOB_STATUSES.REJECTED;
  const canClosePosting = job.status === JOB_STATUSES.PUBLISHED;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixed, never scrolls */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-xl font-bold text-[#000000]">{job.title}</h2>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_STYLES[job.status] || 'bg-[#F1F5F9] text-[#475569]'}`}
            >
              {STATUS_LABELS[job.status] || job.status}
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

        {/* Stat cards — fixed, never scrolls */}
        <div className="grid grid-cols-3 gap-3 p-6 pb-0">
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">Applicants</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">
              {applicantCount === null ? '—' : applicantCount}
            </p>
          </div>
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">{deadlineInfo.label}</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">{deadlineInfo.value}</p>
          </div>
          <div className="rounded-lg bg-[#F1F5F9] p-3 text-center">
            <p className="text-xs text-[#64748B]">Views</p>
            <p className="mt-1 text-lg font-bold text-[#000000]">{job.viewsCount ?? 0}</p>
          </div>
        </div>

        {/* Status history — only this section scrolls */}
        <div className="p-6">
          <p className="mb-2 text-sm font-semibold text-[#000000]">Status history</p>
          <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
            {history.map((entry, index) => (
              <div key={index} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT_COLORS[entry.status] || 'bg-[#94A3B8]'}`}
                />
                <div>
                  <p className="text-sm font-medium text-[#000000]">
                    {getHistoryLabel(entry, index, history)}
                  </p>
                  <p className="text-xs text-[#64748B]">{formatDateTime(entry.changedAt)}</p>
                  {entry.note && <p className="text-xs text-[#64748B]">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — fixed, never scrolls */}
        <div className="flex justify-end gap-3 border-t border-[#E2E8F0] p-6 pt-4">
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
