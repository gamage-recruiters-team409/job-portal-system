import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APPLICATION_STATUSES } from '../../../constants/statuses.js';
import { getApplicantById } from '../../../services/applicantService.js';
import StatusUpdateModal from '../components/StatusUpdateModal.jsx';
import ShortlistConfirmationModal from '../components/ShortlistConfirmationModal.jsx';
import RejectConfirmationModal from '../components/RejectConfirmationModal.jsx';

// ─── Status Badge Config (Matches ApplicantList.jsx) ─────────────────────────

const STATUS_CONFIG = {
  [APPLICATION_STATUSES.APPLIED]: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.SHORTLISTED]: {
    label: 'Shortlisted',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.SELECTED]: {
    label: 'Selected',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  [APPLICATION_STATUSES.WITHDRAWN]: {
    label: 'Withdrawn',
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  },
};

// ─── Avatar Helper ────────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function nameToInitials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function nameToColour(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Present';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return dateString;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const fetchApplicantDetails = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;
      if (!silent) setLoading(true);
      try {
        const response = await getApplicantById(id);
        setApplicationData(response.data);
        setError(null);
        setRefreshError(null);
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load applicant details.';
        if (silent) {
          setRefreshError(message);
        } else {
          setError(message);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    queueMicrotask(() => {
      fetchApplicantDetails();
    });
  }, [fetchApplicantDetails]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-48 rounded-xl bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
              <div className="h-40 rounded-xl bg-gray-200" />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <div className="h-64 rounded-xl bg-gray-200" />
              <div className="h-48 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !applicationData?.application) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Failed to Load Applicant</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'Application not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/applicants')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          &larr; Back to Applicant List
        </button>
      </div>
    );
  }

  const { application, jobSeekerProfile } = applicationData;
  const { jobSeeker, job, status, createdAt } = application;
  const name = jobSeeker?.name || 'Applicant';
  const initials = nameToInitials(name);
  const avatarColour = nameToColour(name);

  // Most recent education calculation
  const latestEducation = jobSeekerProfile?.education?.length
    ? jobSeekerProfile.education[jobSeekerProfile.education.length - 1]
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header / Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/applicants')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <polyline
              points="15 18 9 12 15 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Applicants
        </button>
      </div>

      {/* Non-blocking Refresh Error Banner */}
      {refreshError && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-xs">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Notice: Could not refresh latest applicant status. ({refreshError})</span>
          </div>
          <button
            type="button"
            onClick={() => setRefreshError(null)}
            className="rounded-md p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Personal Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span
                className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColour}`}
              >
                {initials}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                  <StatusBadge status={status} />
                </div>
                {jobSeekerProfile?.currentPosition && (
                  <p className="mt-0.5 text-sm font-medium text-gray-600">
                    {jobSeekerProfile.currentPosition}
                  </p>
                )}
              </div>
            </div>

            {!jobSeekerProfile && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                Notice: This applicant has not completed their detailed profile yet.
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {jobSeeker?.email || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {jobSeekerProfile?.location || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Experience
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {jobSeekerProfile != null
                    ? `${jobSeekerProfile.totalExperienceYears} ${jobSeekerProfile.totalExperienceYears === 1 ? 'year' : 'years'}`
                    : 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {latestEducation
                    ? `${latestEducation.qualification}${latestEducation.fieldOfStudy ? ` in ${latestEducation.fieldOfStudy}` : ''} (${latestEducation.institutionName})`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {jobSeekerProfile?.skills?.length ? (
                jobSeekerProfile.skills.map((skill) => (
                  <span
                    key={skill._id || skill.name}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Card 3: Application Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Application Info</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: About / Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">About / Summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {jobSeekerProfile?.careerSummary || 'No summary provided'}
            </p>
          </div>

          {/* Detailed Experience & Education History (if profile exists) */}
          {jobSeekerProfile?.experience?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Work History</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {jobSeekerProfile.experience.map((exp, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-gray-900">{exp.rolePosition}</p>
                    <p className="text-xs text-gray-600">{exp.organization}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(exp.startDate)} -{' '}
                      {exp.isCurrentRole ? 'Present' : formatDate(exp.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card 1: Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Actions</h2>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Update Status
              </button>

              <button
                type="button"
                onClick={() => setIsShortlistModalOpen(true)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50"
              >
                Shortlist Candidate
              </button>

              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-red-600 shadow-xs transition hover:bg-red-50 hover:border-red-300"
              >
                Reject Candidate
              </button>

              {/* TODO: Wire View and Download CV logic in separate branch */}
              <button
                type="button"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-center text-sm font-medium text-gray-500 opacity-60 cursor-not-allowed"
                title="CV Download will be wired in dedicated CV flow branch"
              >
                View and Download CV
              </button>
            </div>
          </div>

          {/* Card 2: Job Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Job Information</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </span>
                <p className="mt-0.5 font-medium text-gray-900">{job?.title || 'Unknown Job'}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Type
                </span>
                <p className="mt-0.5 font-medium capitalize text-gray-900">
                  {job?.jobType ? job.jobType.replace('_', ' ') : 'N/A'}
                  {job?.workMode ? ` (${job.workMode.replace('_', ' ')})` : ''}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience Required
                </span>
                <p className="mt-0.5 font-medium text-gray-900">
                  {job?.experienceYears != null ? `${job.experienceYears} years` : 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Location
                </span>
                <p className="mt-0.5 font-medium text-gray-900">{job?.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <StatusUpdateModal
        key={isStatusModalOpen ? `status-${id}` : 'status-closed'}
        applicationId={id}
        applicantName={name}
        jobTitle={job?.title}
        currentStatus={status}
        appliedDate={createdAt}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={() => fetchApplicantDetails({ silent: true })}
      />

      <ShortlistConfirmationModal
        key={isShortlistModalOpen ? `shortlist-${id}` : 'shortlist-closed'}
        applicationId={id}
        applicantName={name}
        jobTitle={job?.title}
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        onSuccess={() => fetchApplicantDetails({ silent: true })}
      />

      <RejectConfirmationModal
        key={isRejectModalOpen ? `reject-${id}` : 'reject-closed'}
        applicationId={id}
        applicantName={name}
        jobTitle={job?.title}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSuccess={() => fetchApplicantDetails({ silent: true })}
      />
    </div>
  );
}
