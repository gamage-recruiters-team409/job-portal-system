/**
 * @file AdminJobList.jsx
 * @description List and card view of all job postings for admin moderation and management.
 * Follows the Job Portal System UI Guidelines (Colors, Typography, Spacing, Buttons, and Badges).
 * @module Admin/Jobs/Pages
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  History,
  AlertOctagon,
  Briefcase,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminJobs, moderateAdminJob } from '../../../../services/adminJob.service';
import { JOB_STATUSES } from '../../../../constants/statuses';
import ModerateJobModal from '../components/ModerateJobModal';

/* ─── Status Config & Helpers ─────────────────────────────────────────────── */

const FILTER_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: JOB_STATUSES.PENDING_REVIEW },
  { label: 'Published', value: JOB_STATUSES.PUBLISHED },
  { label: 'Suspended', value: JOB_STATUSES.SUSPENDED },
  { label: 'Rejected', value: JOB_STATUSES.REJECTED },
  { label: 'Closed', value: JOB_STATUSES.CLOSED },
  { label: 'Draft', value: JOB_STATUSES.DRAFT },
];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return 'JB';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/* ─── Main AdminJobList Component ─────────────────────────────────────────── */

const AdminJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter, Search, Pagination state
  const [selectedTab, setSelectedTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 9 cards for 3x3 layout
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);


  // Moderation Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    job: null,
    targetStatus: JOB_STATUSES.PUBLISHED,
  });
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Jobs
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit };
        if (selectedTab) params.status = selectedTab;
        if (debouncedSearch) params.search = debouncedSearch;

        const jobRes = await getAdminJobs(params);

        if (isMounted) {
          const data = jobRes?.data || jobRes;
          setJobs(data?.jobs || []);
          setTotalPages(data?.totalPages || 1);
          setTotalJobs(data?.total || 0);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load job listings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedTab, debouncedSearch, page, limit, refreshTrigger]);

  /* ─── Render Helpers ─────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case JOB_STATUSES.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-green-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            Published
          </span>
        );
      case JOB_STATUSES.PENDING_REVIEW:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
            Pending
          </span>
        );
      case JOB_STATUSES.SUSPENDED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Suspended
          </span>
        );
      case JOB_STATUSES.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Rejected
          </span>
        );
      case JOB_STATUSES.CLOSED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span>
            Closed
          </span>
        );
      case JOB_STATUSES.DRAFT:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200 capitalize">
            {status?.replace('_', ' ') || 'Draft'}
          </span>
        );
    }
  };

  const handleOpenModeration = (job, targetStatus) => {
    setModalState({ isOpen: true, job, targetStatus });
  };

  const handleConfirmModeration = async ({ status, reviewNote }) => {
    if (!modalState.job?._id) return;

    try {
      setIsSubmittingModeration(true);
      await moderateAdminJob(modalState.job._id, { status, reviewNote });

      toast.success(
        `Job "${modalState.job.title}" successfully ${status === 'published' ? 'published' : status}!`
      );

      setModalState({ isOpen: false, job: null, targetStatus: JOB_STATUSES.PUBLISHED });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setIsSubmittingModeration(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Job Posts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, moderate, and manage job listings across the platform.
          </p>
        </div>
      </div>

      {/* ─── Top Statistics KPI Cards (Empty Placeholders) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs min-h-[145px]"></div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs min-h-[145px]"></div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs min-h-[145px]"></div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs min-h-[145px]"></div>
      </div>

      {/* ─── Main Content Box ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {/* Filters & Actions Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row gap-4 w-full justify-between items-start xl:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or keyword..."
              className="w-full h-11 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="w-full xl:w-auto min-w-0 flex xl:justify-end overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl overflow-x-auto max-w-full">
              {FILTER_TABS.map((tab) => {
                const isActive = selectedTab === tab.value;
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setSelectedTab(tab.value);
                      setPage(1);
                    }}
                    className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card Grid Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs animate-pulse flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-slate-200" />
                      <div className="h-6 w-20 rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-5 space-y-2.5">
                      <div className="h-5 w-3/4 rounded bg-slate-200" />
                      <div className="h-4 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <div className="h-10 flex-1 rounded-xl bg-slate-200" />
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-8 text-center">
              <AlertOctagon className="mx-auto h-12 w-12 text-[#DC2626]" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Failed to Load Jobs</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <button
                onClick={() => setRefreshTrigger((p) => p + 1)}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors shadow-xs"
              >
                Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-bold text-slate-900">No Job Postings Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery || selectedTab
                  ? 'No jobs match your current search and filter criteria.'
                  : 'There are currently no job postings on the platform.'}
              </p>
              {(searchQuery || selectedTab) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTab('');
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const companyName = job.companyId?.companyName || 'Unknown Company';
                const companyLogo = job.companyId?.companyLogo;

                return (
                  <div
                    key={job._id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  >
                    {/* Top Row: Logo & Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        {/* Company Logo or Initials */}
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt={companyName}
                            className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] border border-blue-100 font-bold text-[#2563EB] text-sm shadow-2xs">
                            {getInitials(companyName)}
                          </div>
                        )}

                        {/* Status Badge */}
                        {renderStatusBadge(job.status)}
                      </div>

                      {/* Job Title & Details */}
                      <div className="mt-4">
                        <Link
                          to={`/admin/jobs/${job._id}`}
                          className="block text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          title={job.title}
                        >
                          {job.title}
                        </Link>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700 truncate max-w-[140px]">
                            {companyName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[120px]">
                              {job.location || 'Remote'}
                            </span>
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 capitalize">
                            {job.jobType?.replace('_', ' ') || 'Full Time'}
                          </span>
                          {job.workMode && (
                            <span className="rounded-md bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 text-[11px] font-medium capitalize">
                              {job.workMode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {job.status === JOB_STATUSES.SUSPENDED && (
                        <p className="mb-3 text-xs text-[#DC2626] font-medium flex items-center gap-1 truncate">
                          <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                          <span>{job.reviewNote || 'Post suspended for policy review.'}</span>
                        </p>
                      )}
                      {job.status === JOB_STATUSES.REJECTED && (
                        <p className="mb-3 text-xs text-[#DC2626] font-medium flex items-center gap-1 truncate">
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{job.reviewNote || 'Post was rejected by administration.'}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Primary View Details Button */}
                        <Link
                          to={`/admin/jobs/${job._id}`}
                          className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#1E40AF] transition-all"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </Link>

                        {/* Pending Review Actions: Publish / Reject */}
                        {job.status === JOB_STATUSES.PENDING_REVIEW && (
                          <>
                            <button
                              onClick={() => handleOpenModeration(job, JOB_STATUSES.PUBLISHED)}
                              title="Approve & Publish"
                              className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-green-200 hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenModeration(job, JOB_STATUSES.REJECTED)}
                              title="Reject Posting"
                              className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626] border border-red-200 hover:bg-red-200 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {/* Published Action: Suspend */}
                        {job.status === JOB_STATUSES.PUBLISHED && (
                          <button
                            onClick={() => handleOpenModeration(job, JOB_STATUSES.SUSPENDED)}
                            title="Suspend Job Listing"
                            className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626] border border-red-200 hover:bg-red-200 transition-colors"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        )}

                        {/* Suspended or Rejected: History shortcut */}
                        {(job.status === JOB_STATUSES.SUSPENDED ||
                          job.status === JOB_STATUSES.REJECTED) && (
                          <Link
                            to={`/admin/jobs/${job._id}#history`}
                            title="View Status History"
                            className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <History size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Standard Platform Pagination ──────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-xl">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{(page - 1) * limit + 1}</span>{' '}
              to{' '}
              <span className="font-medium text-slate-900">
                {Math.min(page * limit, totalJobs)}
              </span>{' '}
              of <span className="font-medium text-slate-900">{totalJobs}</span> jobs
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  if (pageNumber === page - 2 || pageNumber === page + 2) {
                    return (
                      <span key={pageNumber} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Moderation Modal ────────────────────────────────────────────────── */}
      <ModerateJobModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, job: null, targetStatus: JOB_STATUSES.PUBLISHED })
        }
        onConfirm={handleConfirmModeration}
        job={modalState.job}
        targetStatus={modalState.targetStatus}
        isSubmitting={isSubmittingModeration}
      />
    </div>
  );
};

export default AdminJobList;
