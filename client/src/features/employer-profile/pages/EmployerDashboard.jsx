import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  Users,
  FolderOpen,
  PlusSquare,
  Pencil,
  Upload,
  Plus,
  ChevronRight,
  Loader2,
  RefreshCw,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getMyCompany } from '../../../services/companyService.js';
import { getEmployerStatistics } from '../../../services/statisticsService.js';
import { getApplicants } from '../../../services/applicantService.js';
import ChangeLogoModal from '../components/ChangeLogoModal.jsx';

// Verification Status Badge
function VerificationBadge({ status }) {
  const normalizedStatus = (status || 'pending').toLowerCase();

  if (normalizedStatus === 'verified') {
    return (
      <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#16A34A] transition-colors duration-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }

  if (normalizedStatus === 'rejected') {
    return (
      <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-semibold text-[#DC2626] transition-colors duration-200">
        <AlertCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  if (normalizedStatus === 'unverified') {
    return (
      <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors duration-200">
        <AlertCircle className="h-3.5 w-3.5" />
        Not submitted
      </span>
    );
  }

  return (
    <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#D97706] transition-colors duration-200">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

// Application Status Badge
function ApplicationStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'shortlisted':
      return (
        <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-medium text-[#16A34A]">
          Shortlisted
        </span>
      );
    case 'selected':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
          Selected
        </span>
      );
    case 'under_review':
    case 'reviewing':
    case 'in_review':
      return (
        <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
          Under Review
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-medium text-[#DC2626]">
          Rejected
        </span>
      );
    case 'withdrawn':
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          Withdrawn
        </span>
      );
    case 'applied':
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
          Applied
        </span>
      );
  }
}

// Calculate Company Profile Completeness (11 fields)
function calculateCompleteness(company) {
  if (!company) return 0;
  const fields = [
    'companyName',
    'companyLogo',
    'industry',
    'companySize',
    'foundedYear',
    'website',
    'companyEmail',
    'companyTelephone',
    'companyAddress',
    'companyLocation',
    'companyDescription',
  ];

  const filled = fields.filter((f) => {
    const val = company[f];
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return Boolean(val);
  }).length;

  return Math.round((filled / fields.length) * 100);
}

// Helper to extract initials from name
function getInitials(name) {
  if (!name) return 'AP';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function EmployerDashboard() {
  const navigate = useNavigate();

  // State definitions
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [noCompany, setNoCompany] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [recentApplications, setRecentApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState(null);

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // 1. Fetch Company Profile
  const fetchCompany = useCallback(async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    setNoCompany(false);
    try {
      const res = await getMyCompany();
      const companyData = res?.data?.company || res?.company || res?.data || res;
      setCompany(companyData);
    } catch (err) {
      if (err.response?.status === 404) {
        setNoCompany(true);
        setCompany(null);
      } else {
        console.error('Error fetching company profile:', err);
        setCompanyError(err.response?.data?.message || 'Failed to load company profile.');
      }
    } finally {
      setCompanyLoading(false);
    }
  }, []);

  // 2. Fetch Statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getEmployerStatistics();
      const data = res?.data?.statistics || res?.statistics || res?.data || res;
      setStats(data);
    } catch (err) {
      console.error('Error fetching employer statistics:', err);
      setStatsError(err.response?.data?.message || 'Failed to load statistics.');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 3. Fetch Recent Applications (Employer-wide recent applications)
  const fetchApplications = useCallback(async () => {
    setAppsLoading(true);
    setAppsError(null);
    try {
      // Call employer-wide applicant list endpoint directly (omitting jobId queries all employer jobs).
      // Backend sorts newest-first before pagination, so the first page is already the latest 5.
      const res = await getApplicants({ limit: 5 });
      const appsList =
        res?.data?.applications || res?.applications || res?.data || (Array.isArray(res) ? res : []);
      setRecentApplications(appsList);
    } catch (err) {
      console.error('Error fetching recent applications:', err);
      setAppsError(err.response?.data?.message || 'Failed to load recent applications.');
      setRecentApplications([]);
    } finally {
      setAppsLoading(false);
    }
  }, []);

  // Independent API triggers on mount
  useEffect(() => {
    fetchCompany();
    fetchStats();
    fetchApplications();
  }, [fetchCompany, fetchStats, fetchApplications]);

  const completeness = calculateCompleteness(company);

  // Helper for displaying stat card value
  const getStatValue = (key) => {
    if (statsLoading) {
      return <div className="h-7 w-12 animate-pulse rounded bg-slate-200" />;
    }
    if (statsError || !stats || stats[key] === undefined || stats[key] === null) {
      return '—';
    }
    return stats[key];
  };

  // Stat Cards configuration aligned directly with backend API fields:
  // (totalJobPosts, activeJobs, closedJobs, totalApplicationsReceived)
  const statCardsConfig = [
    {
      label: 'Active jobs',
      key: 'activeJobs',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total applications',
      key: 'totalApplicationsReceived',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total job posts',
      key: 'totalJobPosts',
      icon: FileText,
      color: 'text-[#2563EB] bg-blue-50',
    },
    {
      label: 'Closed jobs',
      key: 'closedJobs',
      icon: CheckCircle2,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  if (companyLoading && statsLoading && appsLoading) {
    return (
      <div className="space-y-6 p-6 font-[Inter,ui-sans-serif,system-ui,sans-serif] animate-pulse">
        {/* Top Banner Skeleton */}
        <div className="h-16 w-full rounded-xl bg-slate-200" />

        {/* Company Header Card Skeleton */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="h-4 w-36 rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2 w-full sm:w-80">
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-2 w-full rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Stat Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-9 w-9 rounded-lg bg-slate-200" />
              </div>
              <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Two Column Layout Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3">
              <div className="h-5 w-28 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-lg bg-slate-200" />
              <div className="h-10 w-full rounded-lg bg-slate-200" />
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3">
              <div className="h-5 w-28 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-6 font-[Inter,ui-sans-serif,system-ui,sans-serif]">
      {/* ── TOP BANNER ── */}
      {companyLoading ? (
        <div className="h-16 w-full animate-pulse rounded-xl bg-slate-200" />
      ) : noCompany ? (
        <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium">
              You have not created a company profile yet. Create your company profile to start posting jobs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/employer/company/create')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Profile</span>
          </button>
        </div>
      ) : company?.verificationStatus === 'verified' ? (
        <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">
              Your company is verified. You can now post jobs and reach candidates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/jobs/create')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Post a job</span>
          </button>
        </div>
      ) : company?.verificationStatus === 'rejected' ? (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Your company profile was rejected.</p>
            {company.rejectionReason && (
              <p className="mt-0.5 text-xs text-red-700">Reason: {company.rejectionReason}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <Clock className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm font-medium">
            Your company profile is pending verification. Our team is reviewing your information.
          </p>
        </div>
      )}

      {/* ── COMPANY HEADER CARD ── */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        {companyLoading ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-10 w-40 rounded bg-slate-200" />
          </div>
        ) : noCompany ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Building2 className="h-12 w-12 text-slate-400" />
            <h2 className="mt-3 text-lg font-bold text-[#0F172A]">No Company Profile Found</h2>
            <p className="mt-1 text-sm text-[#64748B]">Set up your company profile to unlock all employer features.</p>
            <button
              type="button"
              onClick={() => navigate('/employer/company/create')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Company Profile</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo + Details */}
            <div className="flex items-center gap-4">
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.companyName}
                  className="h-16 w-16 rounded-xl object-cover border border-[#E2E8F0] shadow-xs shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 border border-[#E2E8F0]">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-[#0F172A]">{company.companyName}</h1>
                  <VerificationBadge status={company.verificationStatus} />
                </div>
                <p className="mt-1 text-sm text-[#64748B]">
                  {company.industry || 'Industry not set'}
                  {company.companyLocation && ` · ${company.companyLocation}`}
                </p>
              </div>
            </div>

            {/* Completeness Bar & Action */}
            <div className="flex flex-col gap-3 sm:w-80">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#64748B]">Profile Completeness</span>
                <span className="text-[#2563EB]">{completeness}% complete</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/employer/company/edit')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors duration-150 hover:bg-slate-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STAT CARDS GRID (4 total, 4 cols lg, 2 cols sm, 1 col mobile) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((card) => {
          const IconComp = card.icon;
          const val = getStatValue(card.key);

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">{card.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} shadow-xs`}>
                  <IconComp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-[#0F172A]">{val}</div>
            </div>
          );
        })}
      </div>

      {/* ── TWO-COLUMN BODY ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Recent Applications */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0F172A]">Recent applications</h2>
              <Link
                to="/applicants"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] transition-colors duration-150 hover:underline"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4">
              {appsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                          <div className="h-3 w-24 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="h-6 w-20 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : appsError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-red-600">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-sm font-medium">{appsError}</p>
                  <button
                    type="button"
                    onClick={fetchApplications}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retry loading</span>
                  </button>
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm font-medium text-[#0F172A]">No recent applications</p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Applications submitted for your job postings will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((app) => {
                    const applicantName = app.jobSeeker?.name || app.applicantName || app.name || 'Applicant';
                    const roleTitle = app.job?.title || app.appliedRole || app.jobTitle || 'Job Role';
                    const appliedDate = app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      : '—';

                    return (
                      <div key={app._id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-[#2563EB] text-sm">
                            {getInitials(applicantName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{applicantName}</p>
                            <p className="text-xs text-[#64748B]">{roleTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <ApplicationStatusBadge status={app.status} />
                          <span className="hidden text-xs text-[#64748B] sm:inline-block">
                            {appliedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Verification */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-lg font-bold text-[#0F172A]">Quick actions</h2>
            <div className="mt-4 space-y-3">
              {noCompany || !company ? (
                <button
                  type="button"
                  onClick={() => navigate('/employer/company/create')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create company profile</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/jobs/create')}
                    disabled={company.verificationStatus !== 'verified'}
                    title={
                      company.verificationStatus !== 'verified'
                        ? 'Company verification is required to post jobs'
                        : ''
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Post a job</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/employer/company/edit')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-xs transition-colors duration-150 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4 text-slate-500" />
                    <span>Edit company profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-xs transition-colors duration-150 hover:bg-slate-50"
                  >
                    <Upload className="h-4 w-4 text-slate-500" />
                    <span>Upload logo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Verification Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-lg font-bold text-[#0F172A]">Verification</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Status</span>
                <VerificationBadge status={company?.verificationStatus || (noCompany ? 'Unverified' : 'pending')} />
              </div>

              {company?.verificationStatus === 'verified' && (company.verifiedAt || company.verifiedBy) && (
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-[#64748B]">
                  {company.verifiedAt && (
                    <div className="flex items-center justify-between">
                      <span>Verified on</span>
                      <span className="font-medium text-[#0F172A]">
                        {new Date(company.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {company.verifiedBy && (
                    <div className="flex items-center justify-between">
                      <span>Verified by</span>
                      <span className="font-medium text-[#0F172A]">
                        {company.verifiedBy}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {company?.verificationStatus === 'pending' && (
                <p className="border-t border-slate-100 pt-3 text-xs text-[#64748B]">
                  Verification is currently under review by our administration team.
                </p>
              )}

              {company?.verificationStatus === 'rejected' && (
                <p className="border-t border-slate-100 pt-3 text-xs text-red-600">
                  Verification was rejected. Update profile details and submit for re-verification.
                </p>
              )}

              {noCompany && (
                <p className="border-t border-slate-100 pt-3 text-xs text-[#64748B]">
                  Create a company profile to submit your organization for verification.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Logo Modal */}
      {isLogoModalOpen && (
        <ChangeLogoModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          onSuccess={(updatedCompany) => {
            setCompany(updatedCompany);
            setIsLogoModalOpen(false);
            fetchCompany();
          }}
          currentLogo={company?.companyLogo}
        />
      )}
    </div>
  );
}
