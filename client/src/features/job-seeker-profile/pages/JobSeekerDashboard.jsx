import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';
import { getApplicationHistory } from '../../../services/applicationService.js';
import { listJobs } from '../../../services/jobService.js';
import { getJobSeekerStatistics } from '../../../services/statisticsService.js';
import {
  formatExperience,
  formatSalaryCompact,
  timeAgo,
  titleCase,
} from '../../public-jobs/utils/format.js';
import ProfileCompletionCard from '../components/ProfileCompletionCard.jsx';
import { getMyProfileCompletion } from '../services/jobSeekerProfileService.js';

const APPLICATION_STATUS_STYLES = {
  applied: {
    label: 'Applied',
    className: 'border border-blue-200 bg-blue-50 text-blue-700',
  },
  under_review: {
    label: 'Under Review',
    className: 'border border-amber-200 bg-amber-50 text-amber-700',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'border border-purple-200 bg-purple-50 text-purple-700',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    className: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  selected: {
    label: 'Selected',
    className: 'border border-green-200 bg-green-50 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'border border-red-200 bg-red-50 text-red-700',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'border border-slate-200 bg-slate-100 text-slate-600',
  },
};

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatusLabel(status) {
  if (!status) {
    return 'Unknown';
  }

  return status.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function ApplicationsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h1" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShortlistIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  );
}

function SavedJobsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function StatCard({ label, value, icon, iconClassName }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value ?? 0}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardJobCard({ job }) {
  const company = job?.companyId ?? {};
  const companyName = company?.companyName ?? 'Company';

  const salary = formatSalaryCompact(job?.salaryMin, job?.salaryMax, job?.salaryCurrency);

  return (
    <Link
      to={`/jobs/${job?._id}`}
      className="group flex h-[176px] w-[330px] shrink-0 snap-start flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:w-[350px]"
    >
      <div className="flex min-w-0 items-start gap-4">
        {company?.companyLogo ? (
          <img
            src={company.companyLogo}
            alt={companyName}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-base font-semibold text-blue-700">
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
            {job?.title ?? 'Job opportunity'}
          </h3>

          <p className="mt-0.5 truncate text-sm text-slate-500">{companyName}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="whitespace-nowrap text-sm font-semibold text-slate-900">{salary}</p>

          {job?.experienceYears != null && (
            <p className="mt-1 text-xs text-slate-400">{formatExperience(job.experienceYears)}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {job?.location && (
          <span className="inline-flex min-w-0 items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>

            <span className="max-w-[130px] truncate">{job.location}</span>
          </span>
        )}

        {job?.jobType && (
          <span className="inline-flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>

            {titleCase(job.jobType)}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-4">
        <span className="text-xs font-medium text-blue-600">View job</span>

        <span className="whitespace-nowrap text-xs text-slate-400">
          {job?.createdAt ? timeAgo(job.createdAt) : ''}
        </span>
      </div>
    </Link>
  );
}

function SectionLoading({ label }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

function SectionError({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center">
      <p className="text-sm text-red-700">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const style = APPLICATION_STATUS_STYLES[status] ?? {
    label: formatStatusLabel(status),
    className: 'border border-slate-200 bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [statisticsError, setStatisticsError] = useState('');
  const [applicationsError, setApplicationsError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [jobsError, setJobsError] = useState('');

  useEffect(() => {
    let active = true;

    const statisticsRequest = getJobSeekerStatistics();
    const applicationsRequest = getApplicationHistory();
    const completionRequest = getMyProfileCompletion();

    const jobsRequest = listJobs({
      page: 1,
      limit: 8,
    });

    Promise.allSettled([
      statisticsRequest,
      applicationsRequest,
      completionRequest,
      jobsRequest,
    ]).then(([statisticsResult, applicationsResult, completionResult, jobsResult]) => {
      if (!active) {
        return;
      }

      if (statisticsResult.status === 'fulfilled') {
        setStatistics(statisticsResult.value ?? null);
        setStatisticsError('');
      } else {
        setStatisticsError(
          statisticsResult.reason?.response?.data?.message ||
            'Unable to load your dashboard statistics.'
        );
      }

      setStatisticsLoading(false);

      if (applicationsResult.status === 'fulfilled') {
        setApplications(Array.isArray(applicationsResult.value) ? applicationsResult.value : []);
        setApplicationsError('');
      } else {
        setApplicationsError(
          applicationsResult.reason?.response?.data?.message ||
            'Unable to load your recent applications.'
        );
      }

      setApplicationsLoading(false);

      if (completionResult.status === 'fulfilled') {
        setCompletion(completionResult.value ?? null);
        setCompletionError('');
      } else {
        setCompletionError(
          completionResult.reason?.response?.data?.message ||
            'Unable to load your profile completion.'
        );
      }

      setCompletionLoading(false);

      if (jobsResult.status === 'fulfilled') {
        setJobs(Array.isArray(jobsResult.value?.jobs) ? jobsResult.value.jobs.slice(0, 8) : []);
        setJobsError('');
      } else {
        setJobsError(
          jobsResult.reason?.response?.data?.message || 'Unable to load available jobs.'
        );
      }

      setJobsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const retryStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      setStatisticsError('');

      const data = await getJobSeekerStatistics();

      setStatistics(data ?? null);
    } catch (requestError) {
      setStatisticsError(
        requestError?.response?.data?.message || 'Unable to load your dashboard statistics.'
      );
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  const retryApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError('');

      const data = await getApplicationHistory();

      setApplications(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setApplicationsError(
        requestError?.response?.data?.message || 'Unable to load your recent applications.'
      );
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const retryCompletion = useCallback(async () => {
    try {
      setCompletionLoading(true);
      setCompletionError('');

      const data = await getMyProfileCompletion();

      setCompletion(data ?? null);
    } catch (requestError) {
      setCompletionError(
        requestError?.response?.data?.message || 'Unable to load your profile completion.'
      );
    } finally {
      setCompletionLoading(false);
    }
  }, []);

  const retryJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError('');

      const data = await listJobs({
        page: 1,
        limit: 8,
      });

      setJobs(Array.isArray(data?.jobs) ? data.jobs.slice(0, 8) : []);
    } catch (requestError) {
      setJobsError(requestError?.response?.data?.message || 'Unable to load available jobs.');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((first, second) => {
        const firstDate = new Date(first?.createdAt ?? 0).getTime();

        const secondDate = new Date(second?.createdAt ?? 0).getTime();

        return secondDate - firstDate;
      })
      .slice(0, 8);
  }, [applications]);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s an overview of your job search activity.
          </p>
        </div>

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Your overview</h2>
          </div>

          {statisticsLoading ? (
            <SectionLoading label="Loading your statistics..." />
          ) : statisticsError ? (
            <SectionError message={statisticsError} onRetry={retryStatistics} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total applications"
                value={statistics?.totalApplications}
                icon={<ApplicationsIcon />}
                iconClassName="bg-blue-50 text-blue-600"
              />

              <StatCard
                label="Under review"
                value={statistics?.underReview}
                icon={<ReviewIcon />}
                iconClassName="bg-amber-50 text-amber-600"
              />

              <StatCard
                label="Shortlisted"
                value={statistics?.shortlisted}
                icon={<ShortlistIcon />}
                iconClassName="bg-purple-50 text-purple-600"
              />

              <StatCard
                label="Saved jobs"
                value={statistics?.savedJobs}
                icon={<SavedJobsIcon />}
                iconClassName="bg-green-50 text-green-600"
              />
            </div>
          )}
        </section>

        {/* Explore Jobs */}
        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Explore jobs</h2>

              <p className="mt-1 text-sm text-slate-500">
                Take a look at currently available job opportunities.
              </p>
            </div>

            <Link
              to="/jobs"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              View all jobs
            </Link>
          </div>

          {jobsLoading ? (
            <SectionLoading label="Loading available jobs..." />
          ) : jobsError ? (
            <SectionError message={jobsError} onRetry={retryJobs} />
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h3 className="text-sm font-semibold text-slate-900">
                No jobs are currently available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Check again later for newly published opportunities.
              </p>
            </div>
          ) : (
            <div
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
              aria-label="Available jobs"
            >
              {jobs.map((job) => (
                <DashboardJobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Applications + Profile Completion */}
        <div className="mt-7 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent applications</h2>

                <p className="mt-1 text-xs text-slate-400">Your latest job application activity.</p>
              </div>

              <Link
                to="/my-applications"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 p-5">
              {applicationsLoading ? (
                <SectionLoading label="Loading applications..." />
              ) : applicationsError ? (
                <SectionError message={applicationsError} onRetry={retryApplications} />
              ) : recentApplications.length === 0 ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                  <h3 className="text-sm font-semibold text-slate-900">No applications yet</h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Start exploring available jobs and your applications will appear here.
                  </p>

                  <Link
                    to="/jobs"
                    className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Browse jobs
                  </Link>
                </div>
              ) : (
                <div
                  className="max-h-[360px] space-y-3 overflow-y-auto overscroll-contain pr-1"
                  tabIndex={0}
                  aria-label="Recent applications list"
                >
                  {recentApplications.map((application) => (
                    <div
                      key={application._id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {application?.job?.title ?? 'Job unavailable'}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {application?.job?.companyId?.companyName ?? 'Company'}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          Applied {formatDate(application?.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <StatusBadge status={application?.status} />

                        <Link
                          to={`/my-applications/${application._id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="h-full [&>*]:h-full">
            {completionLoading ? (
              <SectionLoading label="Loading profile completion..." />
            ) : completionError ? (
              <SectionError message={completionError} onRetry={retryCompletion} />
            ) : (
              <ProfileCompletionCard
                completion={completion}
                onViewDetails={() => navigate('/profile/completion')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
