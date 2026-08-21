import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APPLICATION_STATUSES } from '../../../constants/statuses.js';
import {
  getApplicants,
  getEmployerJobs,
  getApplicantFilterOptions,
} from '../../../services/applicantService.js';
import { getSkills } from '../../../services/referenceService.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

function parseExperienceRange(expKey) {
  switch (expKey) {
    case '0-1':
      return { minExperience: 0, maxExperience: 1 };
    case '1-3':
      return { minExperience: 1, maxExperience: 3 };
    case '3-5':
      return { minExperience: 3, maxExperience: 5 };
    case '5+':
      return { minExperience: 5, maxExperience: undefined };
    default:
      return { minExperience: undefined, maxExperience: undefined };
  }
}

/**
 * Status badge configuration.
 * Only uses values from APPLICATION_STATUSES — never invented values.
 */
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

// ─── Avatar initials helper ───────────────────────────────────────────────────

/** Maps a name string to a consistent-ish hue so each applicant gets a unique colour. */
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

// ─── Small, reusable sub-components ──────────────────────────────────────────

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

function ApplicantAvatar({ name }) {
  const initials = nameToInitials(name);
  const colour = nameToColour(name);
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colour}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Native <select> styled to match the Figma dropdown controls. */
function FilterSelect({ id, value, onChange, children, disabled }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
    >
      {children}
    </select>
  );
}

/** Loading skeleton row */
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {[120, 100, 80, 90, 90, 70].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className={`h-4 rounded bg-gray-200`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

  /** Build page number list with ellipsis: [1] … [4 5 6] … [10] */
  const buildPageList = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('…');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const pageList = buildPageList();

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing {firstItem} to {lastItem} of {totalItems} applicants
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <PageBtn
          label="Previous"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {pageList.map((item, idx) =>
          item === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400 select-none">
              •••
            </span>
          ) : (
            <PageBtn
              key={item}
              label={String(item)}
              onClick={() => onPageChange(item)}
              active={item === currentPage}
            />
          )
        )}

        <PageBtn
          label="Next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </nav>
    </div>
  );
}

function PageBtn({ label, onClick, active, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition
        ${active ? 'bg-blue-600 text-white shadow-sm' : ''}
        ${!active && !disabled ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : ''}
        ${disabled ? 'cursor-not-allowed border border-gray-200 bg-white text-gray-300' : ''}
      `}
    >
      {label}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApplicantList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Filter state (draft — only applied on "Apply Filters" click) ──
  const [draftSearch, setDraftSearch] = useState('');
  const [draftJobId, setDraftJobId] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftExperience, setDraftExperience] = useState('');
  const [draftSkill, setDraftSkill] = useState('');
  const [draftEducation, setDraftEducation] = useState('');

  // ── Applied (committed) filters — these drive the API call ──
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    jobId: '',
    status: '',
    skill: '',
    education: '',
    minExperience: undefined,
    maxExperience: undefined,
  });

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Data ──
  const [applicants, setApplicants] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Options lists ──
  const [jobOptions, setJobOptions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [skillOptions, setSkillOptions] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [educationOptions, setEducationOptions] = useState([]);
  const [educationLoading, setEducationLoading] = useState(true);

  // Abort controller ref so changing filters cancels in-flight requests
  const abortRef = useRef(null);

  // ── Sync URL 'search' query param to filter state ──
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setDraftSearch(urlSearch);
      setAppliedFilters((prev) => ({ ...prev, search: urlSearch }));
      setCurrentPage(1);
    } else {
      // When the param is removed, reset the search state
      setDraftSearch('');
      setAppliedFilters((prev) => ({ ...prev, search: '' }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // ── Load employer's job list once on mount ──
  useEffect(() => {
    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await getEmployerJobs();
        const jobs = Array.isArray(response?.data?.jobs)
          ? response.data.jobs
          : Array.isArray(response)
            ? response
            : [];
        setJobOptions(jobs);

        // Auto-select if there's only one job
        if (jobs.length === 1) {
          const jobId = jobs[0]._id;
          setDraftJobId(jobId);
          setAppliedFilters((prev) => ({ ...prev, jobId }));
        }
      } catch {
        // Non-fatal: job dropdown will just show "All Jobs" with no options
        setJobOptions([]);
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, []);

  // ── Load Skills and Education filter options on mount ──
  useEffect(() => {
    const loadFilterOptions = async () => {
      setSkillsLoading(true);
      setEducationLoading(true);

      try {
        const skillsData = await getSkills();
        const mappedSkills = (Array.isArray(skillsData) ? skillsData : []).map((s) => ({
          _id: s._id,
          name: s.skillName || s.name || '',
        }));
        setSkillOptions(mappedSkills);
      } catch {
        setSkillOptions([]);
      } finally {
        setSkillsLoading(false);
      }

      try {
        const eduData = await getApplicantFilterOptions();
        const options = eduData?.data?.educationOptions ?? eduData?.educationOptions ?? [];
        setEducationOptions(options);
      } catch {
        setEducationOptions([]);
      } finally {
        setEducationLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // ── Fetch applicants whenever filters or page change ──
  const fetchApplicants = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError('');

    try {
      const response = await getApplicants({
        search: appliedFilters.search || undefined,
        jobId: appliedFilters.jobId || undefined,
        status: appliedFilters.status || undefined,
        skill: appliedFilters.skill || undefined,
        education: appliedFilters.education || undefined,
        minExperience: appliedFilters.minExperience,
        maxExperience: appliedFilters.maxExperience,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        signal: controller.signal,
      });

      // Ignore this response if a newer request has since started.
      if (abortRef.current !== controller) return;

      const payload = response?.data ?? response ?? {};
      const list = Array.isArray(payload.applications) ? payload.applications : [];
      const total = payload.pagination?.total ?? list.length;
      const pages = payload.pagination?.totalPages ?? Math.ceil(total / ITEMS_PER_PAGE) ?? 1;

      setApplicants(list);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
      if (abortRef.current !== controller) return;
      setError(err?.response?.data?.message ?? 'Failed to load applicants. Please try again.');
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [appliedFilters, currentPage]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchApplicants();
    });

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchApplicants]);

  // ── Filter actions ──
  const handleApplyFilters = () => {
    setCurrentPage(1);
    const { minExperience, maxExperience } = parseExperienceRange(draftExperience);
    setAppliedFilters({
      search: draftSearch.trim(),
      jobId: draftJobId,
      status: draftStatus,
      skill: draftSkill,
      education: draftEducation,
      minExperience,
      maxExperience,
    });
  };

  const handleReset = () => {
    setDraftSearch('');
    setDraftJobId('');
    setDraftStatus('');
    setDraftExperience('');
    setDraftSkill('');
    setDraftEducation('');
    setCurrentPage(1);
    setAppliedFilters({
      search: '',
      jobId: '',
      status: '',
      skill: '',
      education: '',
      minExperience: undefined,
      maxExperience: undefined,
    });
  };

  const handleView = (applicantId) => {
    navigate(`/applicants/${applicantId}`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full p-6 lg:p-8">
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Applicant Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and review all applicants who applied for your jobs.
        </p>
      </div>

      {/* ── Filters card ── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Card header */}
        <div className="mb-4 flex items-center gap-2">
          {/* Funnel icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
            aria-hidden="true"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Filters</span>
        </div>

        {/* Row 1: Search · Job · Status · Experience */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label htmlFor="filter-search" className="mb-1 block text-xs font-medium text-gray-600">
              Search
            </label>
            <div className="relative">
              <input
                id="filter-search"
                type="text"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                placeholder="search by name, email…"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Job dropdown */}
          <div>
            <label htmlFor="filter-job" className="mb-1 block text-xs font-medium text-gray-600">
              Job
            </label>
            <FilterSelect
              id="filter-job"
              value={draftJobId}
              onChange={(e) => setDraftJobId(e.target.value)}
              disabled={jobsLoading}
            >
              <option value="">All Jobs</option>
              {jobOptions.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </FilterSelect>
          </div>

          {/* Status dropdown — only APPLICATION_STATUSES values */}
          <div>
            <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-gray-600">
              Status
            </label>
            <FilterSelect
              id="filter-status"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.entries(APPLICATION_STATUSES).map(([key, value]) => (
                <option key={value} value={value}>
                  {STATUS_CONFIG[value]?.label ?? key}
                </option>
              ))}
            </FilterSelect>
          </div>

          {/* Experience dropdown */}
          <div>
            <label
              htmlFor="filter-experience"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Experience
            </label>
            <FilterSelect
              id="filter-experience"
              value={draftExperience}
              onChange={(e) => setDraftExperience(e.target.value)}
            >
              <option value="">All Experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </FilterSelect>
          </div>
        </div>

        {/* Row 2: Skills · Education · Action buttons */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Skills dropdown */}
          <div>
            <label htmlFor="filter-skills" className="mb-1 block text-xs font-medium text-gray-600">
              Skills
            </label>
            <FilterSelect
              id="filter-skills"
              value={draftSkill}
              onChange={(e) => setDraftSkill(e.target.value)}
              disabled={skillsLoading}
            >
              <option value="">All Skills</option>
              {skillOptions.map((skill) => (
                <option key={skill._id} value={skill._id}>
                  {skill.name}
                </option>
              ))}
            </FilterSelect>
          </div>

          {/* Educations dropdown */}
          <div>
            <label
              htmlFor="filter-educations"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Educations
            </label>
            <FilterSelect
              id="filter-educations"
              value={draftEducation}
              onChange={(e) => setDraftEducation(e.target.value)}
              disabled={educationLoading}
            >
              <option value="">All Educations</option>
              {educationOptions.map((qual) => (
                <option key={qual} value={qual}>
                  {qual}
                </option>
              ))}
            </FilterSelect>
          </div>

          {/* Spacer to push buttons to the right on desktop screens */}
          <div className="hidden xl:block" />

          {/* Action buttons */}
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 xl:col-span-1">
            <button
              id="btn-apply-filters"
              type="button"
              onClick={handleApplyFilters}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Apply Filters
            </button>

            <button
              id="btn-reset-filters"
              type="button"
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Results card ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-red-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchApplicants}
              className="mt-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Table (loading skeleton + real data) */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" aria-label="Applicants table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['APPLICANT', 'JOB', 'EXPERIENCE', 'STATUS', 'APPLIED DATE', 'ACTIONS'].map(
                    (col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* Loading skeleton rows */}
                {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {/* Real data rows */}
                {!isLoading &&
                  applicants.map((applicant) => {
                    const appliedDate = applicant.createdAt
                      ? new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A';

                    const name = applicant.jobSeeker?.name ?? 'Unknown';
                    const email = applicant.jobSeeker?.email ?? '';

                    const jobTitle = applicant.job?.title ?? '—';

                    const experience =
                      applicant.totalExperienceYears !== undefined &&
                      applicant.totalExperienceYears !== null
                        ? `${applicant.totalExperienceYears} Years`
                        : '—';

                    return (
                      <tr key={applicant._id} className="group transition-colors hover:bg-gray-50">
                        {/* Applicant: avatar + name + email */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <ApplicantAvatar name={name} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900">{name}</p>
                              {email && <p className="truncate text-xs text-gray-400">{email}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Job */}
                        <td className="px-4 py-3.5 text-gray-700">{jobTitle}</td>

                        {/* Experience */}
                        <td className="px-4 py-3.5 text-gray-700">{experience}</td>

                        {/* Status badge */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={applicant.status} />
                        </td>

                        {/* Applied date */}
                        <td className="px-4 py-3.5 text-gray-700">{appliedDate}</td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-view-${applicant._id}`}
                              type="button"
                              onClick={() => handleView(applicant._id)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Empty state — shown only when not loading and no error and no rows */}
            {!isLoading && !error && applicants.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-300"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No applicants found</p>
                <p className="text-xs text-gray-400">
                  Try adjusting your filters or reset to view all applicants.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalItems > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
