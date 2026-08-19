/**
 * @file AdminJobDetails.jsx
 * @description Dedicated Job Details and Moderation view for Admin management.
 * Follows the Job Portal System UI Guidelines (Colors, Typography, Spacing, Buttons, and Badges).
 * @module Admin/Jobs/Pages
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  History,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminJobById, moderateAdminJob } from '../../../../services/adminJob.service';
import { JOB_STATUSES } from '../../../../constants/statuses';
import ModerateJobModal from '../components/ModerateJobModal';

/* ─── Helpers & Configurations ─────────────────────────────────────────────── */

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

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

/* ─── Main AdminJobDetails Component ──────────────────────────────────────── */

const AdminJobDetails = () => {
  const { id, jobId: routeJobId } = useParams();
  const jobId = id || routeJobId;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Moderation modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    targetStatus: JOB_STATUSES.PUBLISHED,
  });
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAdminJobById(jobId);
        if (isMounted) {
          setJob(res?.data?.job || res?.data || res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch job details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleOpenModeration = (targetStatus) => {
    setModalState({ isOpen: true, targetStatus });
  };

  const handleConfirmModeration = async ({ status, reviewNote }) => {
    if (!job?._id) return;

    try {
      setIsSubmittingModeration(true);
      const res = await moderateAdminJob(job._id, { status, reviewNote });
      const updatedJob = res?.data?.job || res?.data || { ...job, status, reviewNote };

      toast.success(
        `Job "${job.title}" successfully ${status === 'published' ? 'published' : status}!`
      );
      setJob(updatedJob);
      setModalState({ isOpen: false, targetStatus: JOB_STATUSES.PUBLISHED });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job moderation status.');
    } finally {
      setIsSubmittingModeration(false);
    }
  };

  /* ─── Status Badge Render Helper ─────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case JOB_STATUSES.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-green-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            Published
          </span>
        );
      case JOB_STATUSES.PENDING_REVIEW:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
            Pending Review
          </span>
        );
      case JOB_STATUSES.SUSPENDED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Suspended
          </span>
        );
      case JOB_STATUSES.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Rejected
          </span>
        );
      case JOB_STATUSES.CLOSED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span>
            Closed
          </span>
        );
      case JOB_STATUSES.DRAFT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200 capitalize">
            {status?.replace('_', ' ') || 'Draft'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-16">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        <div className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Job Not Found</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {error || 'The requested job post does not exist or was removed.'}
        </p>
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Job Posts
        </Link>
      </div>
    );
  }

  const companyName = job.companyId?.companyName || 'Unknown Company';
  const isDeadlinePassed = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 max-w-full pb-16 animate-in fade-in duration-200">
      {/* ─── Header & Breadcrumbs ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-1.5">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <Link to="/admin/jobs" className="hover:text-blue-600 transition-colors shrink-0">
              Manage Job Posts
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium truncate max-w-[160px] sm:max-w-[280px]">
              {job.title}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {job.title}
          </h1>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/admin/jobs"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-10 sm:h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Back to list</span>
          </Link>

          {/* Pending Review Actions */}
          {job.status === JOB_STATUSES.PENDING_REVIEW && (
            <>
              <button
                onClick={() => handleOpenModeration(JOB_STATUSES.PUBLISHED)}
                disabled={isDeadlinePassed}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-10 sm:h-11 bg-[#16A34A] hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} />
                <span>Approve & Publish</span>
              </button>
              <button
                onClick={() => handleOpenModeration(JOB_STATUSES.REJECTED)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-10 sm:h-11 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-2xs"
              >
                <XCircle size={16} />
                <span>Reject Job</span>
              </button>
            </>
          )}

          {/* Published Action: Suspend */}
          {job.status === JOB_STATUSES.PUBLISHED && (
            <button
              onClick={() => handleOpenModeration(JOB_STATUSES.SUSPENDED)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-10 sm:h-11 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-2xs"
            >
              <ShieldAlert size={16} />
              <span>Suspend Job</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Hero Overview Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-2xs w-full min-w-0">
        <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-start md:justify-between w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0 flex-1">
            {job.companyId?.companyLogo ? (
              <img
                src={job.companyId.companyLogo}
                alt={companyName}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-contain border border-slate-100 bg-slate-50 p-2 shadow-2xs shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] border border-blue-100 font-bold text-[#2563EB] text-lg sm:text-xl shadow-2xs">
                {getInitials(companyName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight break-words">
                  {job.title}
                </h2>
                {renderStatusBadge(job.status)}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-2.5 sm:gap-x-3 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[160px] sm:max-w-none">{companyName}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{job.location || 'Remote'}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Highlight Stat Boxes */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 border-t border-slate-100 pt-5 sm:pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50/70 p-3 sm:p-3.5 border border-slate-200/80">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Employment Type
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 capitalize truncate">
              {job.jobType?.replace('_', ' ') || 'Full Time'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/70 p-3 sm:p-3.5 border border-slate-200/80">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Work Mode
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 capitalize truncate">
              {job.workMode || 'On-site'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/70 p-3 sm:p-3.5 border border-slate-200/80">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Experience Level
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 truncate">
              {job.experienceYears > 0 ? `${job.experienceYears}+ Years` : 'Entry / Any'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/70 p-3 sm:p-3.5 border border-slate-200/80">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Salary Offering
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 truncate">
              {job.salaryMin
                ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax ? job.salaryMax.toLocaleString() : 'Negotiable'}`
                : 'Not Disclosed'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Details Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Job Profile Content) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center gap-3.5 text-slate-900 border-b border-slate-100 pb-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                <Layers className="h-5 w-5 text-[#2563EB]" />
              </div>
              <h3 className="text-lg font-bold">Job Description</h3>
            </div>
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center gap-3.5 text-slate-900 border-b border-slate-100 pb-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Briefcase className="h-5 w-5 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-bold">Key Responsibilities</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {job.responsibilities}
              </div>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center gap-3.5 text-slate-900 border-b border-slate-100 pb-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7]">
                  <Award className="h-5 w-5 text-[#D97706]" />
                </div>
                <h3 className="text-lg font-bold">Requirements & Qualifications</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center gap-3.5 text-slate-900 border-b border-slate-100 pb-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <Sparkles className="h-5 w-5 text-[#16A34A]" />
                </div>
                <h3 className="text-lg font-bold">Perks & Benefits</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {job.benefits}
              </div>
            </div>
          )}

          {/* Skills & Category */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3.5">
              Category & Required Skills
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {job.category?.name || 'General'}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Required Skills
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((skill) => (
                      <span
                        key={skill._id || skill.skillName}
                        className="rounded-xl border border-blue-100 bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#2563EB]"
                      >
                        {skill.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No specific skills listed.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Company & Status History Audit) */}
        <div className="space-y-6">
          {/* Company Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#2563EB]" />
              <span>Company Information</span>
            </h3>

            <div className="mt-4 flex items-center gap-3.5">
              {job.companyId?.companyLogo ? (
                <img
                  src={job.companyId.companyLogo}
                  alt={companyName}
                  className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] font-bold text-[#2563EB] text-sm">
                  {getInitials(companyName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 truncate">{companyName}</h4>
                <p className="text-xs text-slate-500 truncate">
                  {job.companyId?.industry || 'Industry not specified'}
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Verification Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#16A34A] capitalize">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                {job.companyId?.verificationStatus || 'unverified'}
              </span>
            </div>

            {/* Link to Employer Details */}
            {job.companyId?._id && (
              <Link
                to={`/admin/employers/${job.companyId._id}`}
                className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>View Company Profile</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            )}
          </div>

          {/* Posting Timeline & Deadlines */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#2563EB]" />
              <span>Timeline & Deadlines</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="font-semibold text-slate-800">{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Updated:</span>
                <span className="font-semibold text-slate-800">{formatDate(job.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application Deadline:</span>
                <span
                  className={`font-bold ${isDeadlinePassed ? 'text-red-600' : 'text-slate-800'}`}
                >
                  {formatDate(job.deadline)}
                  {isDeadlinePassed && ' (Expired)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created By:</span>
                <span className="font-semibold text-slate-800">
                  {job.createdBy?.name || job.createdBy?.email || 'Employer'}
                </span>
              </div>
            </div>
          </div>

          {/* Status History & Audit Trail */}
          <div
            id="history"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-[#2563EB]" />
              <span>Moderation History</span>
            </h3>

            {/* Latest Review Note if present */}
            {job.reviewNote && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <span className="font-bold text-slate-700 block">Latest Admin Review Note:</span>
                <p className="mt-1 text-slate-600 italic">"{job.reviewNote}"</p>
                {job.reviewedAt && (
                  <span className="mt-2 block text-[11px] text-slate-400">
                    Reviewed on {formatDateTime(job.reviewedAt)}
                  </span>
                )}
              </div>
            )}

            {/* Full statusHistory timeline */}
            {job.statusHistory && job.statusHistory.length > 0 ? (
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-200 mt-4">
                {job.statusHistory.map((entry, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white ring-4 ring-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 capitalize">
                          {entry.status?.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(entry.changedAt)}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No moderation changes recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Moderation Modal ────────────────────────────────────────────────── */}
      <ModerateJobModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, targetStatus: JOB_STATUSES.PUBLISHED })}
        onConfirm={handleConfirmModeration}
        job={job}
        targetStatus={modalState.targetStatus}
        isSubmitting={isSubmittingModeration}
      />
    </div>
  );
};

export default AdminJobDetails;
