import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationDetails } from '../../../services/applicationService.js';
import LoadingState from '../../../components/jobs/LoadingState.jsx';

/**
 * @file ApplicationDetailsPage.jsx
 * @description Application Details page — status banner, status timeline
 * with connecting lines, cover letter, CV info, and employer note.
 */

// Ordered timeline steps. "Selected" is the confirmed final-approval
// label (not "Approved") — see the development report.
const TIMELINE_STEPS = ['applied', 'under_review', 'shortlisted', 'selected'];

const STATUS_LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  selected: 'Selected',
  rejected: 'Rejected',
};

const BADGE_STYLES = {
  applied: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-yellow-100 text-yellow-800',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const BANNER_STYLES = {
  applied: 'bg-blue-50 text-blue-700',
  under_review: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-blue-50 text-blue-700',
  selected: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getBannerMessage(application) {
  const { status, job } = application;
  const companyName = job?.companyId?.companyName ?? 'The employer';
  switch (status) {
    case 'applied':
      return `Your application has been received. ${companyName} will review it shortly.`;
    case 'under_review':
      return "Your application is under review. We'll notify you as soon as there's an update.";
    case 'shortlisted':
      return "Your application has been shortlisted. We'll notify you as soon as there's an update.";
    case 'selected':
      return `Good news! ${companyName} has selected your application for this role. They will contact you with next steps.`;
    case 'rejected':
      return `${companyName} has decided to move forward with other candidates. We apologize for the inconvenience caused.`;
    default:
      return "Your application is under review. We'll notify you as soon as there's an update.";
  }
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const STATUS_TIMELINE_STYLES = {
  applied: { className: 'border-blue-500 text-blue-700', bg: '#DBEAFE' },
  under_review: { className: 'border-amber-500 text-amber-700', bg: '#FEF3C7' },
  shortlisted: { className: 'border-yellow-500 text-yellow-700', bg: '#FEF9C3' },
  selected: { className: 'border-green-500 text-green-700', bg: '#CAEBC6' },
  rejected: { className: 'border-red-500 text-red-600', bg: '#FEE2E2' },
};

function StatusTimeline({ application }) {
  const { status, statusHistory, createdAt } = application;

  const history =
    statusHistory && statusHistory.length > 0
      ? statusHistory
      : [{ status: 'applied', changedAt: createdAt }];

  return (
    <>
      <style>{`
        @keyframes statusCirclePop {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }

          60% {
            opacity: 1;
            transform: scale(1.15);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes statusIconPop {
          0% {
            opacity: 0;
            transform: scale(0);
          }

          60% {
            opacity: 1;
            transform: scale(1.2);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes statusLineGrow {
          0% {
            transform: scaleX(0);
          }

          100% {
            transform: scaleX(1);
          }
        }

        .status-timeline-circle {
          opacity: 0;
          animation: statusCirclePop 0.5s ease-out forwards;
        }

        .status-timeline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          animation: statusIconPop 0.35s ease-out 0.2s forwards;
        }

        .status-timeline-line-fill {
          transform: scaleX(0);
          transform-origin: left center;
          animation: statusLineGrow 0.55s ease-out forwards;
        }
      `}</style>

      <div className="rounded-xl border border-slate-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Status Timeline
          </h2>

          <span className="text-sm font-medium text-slate-500">
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 overflow-x-auto px-2">
          {history.map((entry, i) => {
            const isCurrent = i === history.length - 1;

            const style = STATUS_TIMELINE_STYLES[entry.status] ?? {
              className: 'border-slate-400 text-slate-600',
              bg: '#F1F5F9',
            };

            const isRejectedEntry = entry.status === 'rejected';
            const isLastStep = i === history.length - 1;

            return (
              <div
                key={`${entry.status}-${entry.changedAt}-${i}`}
                className="flex flex-1 items-start"
              >
                {/* STATUS CIRCLE */}
                <div className="flex min-w-[90px] flex-col items-center text-center">
                  <div
                    className={`status-timeline-circle flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${style.className}`}
                    style={{
                      backgroundColor: style.bg,
                      boxShadow: isCurrent
                        ? '0 0 0 4px rgba(34,197,94,.12)'
                        : undefined,
                      animationDelay: `${i * 0.25}s`,
                    }}
                  >
                    <span className="status-timeline-icon">
                      {isRejectedEntry ? <CrossIcon /> : <CheckIcon />}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(entry.changedAt)}
                  </p>
                </div>

                {/* CONNECTING LINE */}
                {!isLastStep && (
                  <div
                    className="relative mt-5 flex-1 px-2"
                    style={{
                      animationDelay: `${i * 0.25 + 0.3}s`,
                    }}
                  >
                    <div className="h-[3px] w-full rounded-full bg-slate-200" />

                    <div
                      className="status-timeline-line-fill absolute left-2 top-0 h-[3px] w-[calc(100%-16px)] rounded-full bg-green-400"
                      style={{
                        animationDelay: `${i * 0.25 + 0.3}s`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchDetails() {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationDetails(id);
      setApplication(data);
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError(err?.response?.data?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <LoadingState label="Loading application details…" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error || 'Application not found.'}
        </div>
      </div>
    );
  }

  const { job, status, coverLetter, resume, createdAt, updatedAt, employerNote } = application;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/my-applications"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:underline"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Application History
      </Link>

      <div
        className={`mb-4 rounded-xl px-4 py-3 text-sm ${BANNER_STYLES[status] ?? 'bg-blue-50 text-blue-700'}`}
      >
        {getBannerMessage(application)}
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {job?.title ?? 'Job unavailable'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {job?.companyId?.companyName ?? 'Company'} · {job?.location ?? '—'} ·{' '}
            {job?.jobType ?? '—'} · {job?.workMode ?? '—'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Applied: {formatDate(createdAt)} &nbsp;·&nbsp; Status updated: {formatDate(updatedAt)}
          </p>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${BADGE_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="mb-6">
        <StatusTimeline application={application} />
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Cover Letter</h2>
          <p className="whitespace-pre-line text-sm text-slate-600">
            {coverLetter || 'No cover letter was submitted with this application.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">CV / Resume</h2>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-800">{resume?.fileName ?? 'resume.pdf'}</p>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Downloads are handled through the employer's secure CV access flow.
          </p>
        </div>
      </div>

      {employerNote && (
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Note from Employer</h2>
          <p className="text-sm text-slate-600">{employerNote}</p>
        </div>
      )}
    </div>
  );
}
