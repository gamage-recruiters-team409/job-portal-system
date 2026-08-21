/**
 * @file AdminDashboard.jsx
 * @description Master landing dashboard for the Admin Console.
 * Displays real-time platform KPIs, pending moderation queues, and quick navigation modules.
 * Fully aligned with UI Rules & Guidelines.
 * @module Admin/Dashboard
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStatistics } from '../../../services/statisticsService';
import { getAdminEmployers } from '../../../services/adminEmployer.service';
import { getAdminReports } from '../../../services/adminReport.service';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  Briefcase, 
  AlertOctagon, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Layers,
  Settings,
  Eye,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Data States
  const [stats, setStats] = useState(null);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Section Error States
  const [statsError, setStatsError] = useState(false);
  const [employersError, setEmployersError] = useState(false);
  const [reportsError, setReportsError] = useState(false);
  
  const hasErrors = statsError || employersError || reportsError;

  // Helper to format numbers with commas
  const formatNumber = (num, isError = false) => {
    if (isError) return 'N/A';
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };

  // Helper to format report reasons to clean sentence case
  const formatReason = (reason) => {
    if (!reason) return 'Reported';
    const clean = reason.replace(/_/g, ' ').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  // Helper to get company initials
  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Fetch all dashboard data concurrently
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setStatsError(false);
      setEmployersError(false);
      setReportsError(false);

      const [statsResult, employersResult, reportsResult] = await Promise.allSettled([
        getAdminStatistics(),
        getAdminEmployers({ status: 'pending', limit: 4 }),
        getAdminReports({ status: 'pending', limit: 4 }),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        setStatsError(true);
      }

      if (employersResult.status === 'fulfilled') {
        setPendingEmployers(employersResult.value?.data?.companies || []);
      } else {
        setEmployersError(true);
      }

      if (reportsResult.status === 'fulfilled') {
        setPendingReports(reportsResult.value?.data?.reports || []);
      } else {
        setReportsError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Greeting and Date helpers
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'Administrator';

  return (
    <div className="flex flex-col gap-8 w-full pb-16">
      {/* ─── 1. Welcome & Status Banner ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* Live system status pill following section 7 badge format */}
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              {hasErrors ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                  Degraded Performance
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                  All Systems Operational
                </span>
              )}
              <span className="text-xs font-medium text-slate-400">•</span>
              <span className="text-xs font-normal text-slate-500">{formattedDate}</span>
            </div>

            {/* Greeting */}
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-sm font-normal text-slate-600 leading-relaxed">
              Welcome back to your administration portal. Monitor platform growth, moderate new job postings, and review pending employer verifications in real-time.
            </p>
          </div>

          {/* Quick Actions / Refresh in Header */}
          <div className="flex items-center gap-3 w-full sm:w-auto self-end lg:self-center">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 px-4 h-11 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={16}
                className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}
              />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </button>

            <Link
              to="/admin/settings"
              className="inline-flex items-center justify-center gap-2 px-4 h-11 bg-blue-600 hover:bg-blue-800 text-white font-medium text-sm rounded-xl transition-all"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. Global Error State (Removed for granular section errors) ─── */}

      {/* ─── 3. Top Metrics & KPI Cards (5 Standardized Cards) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {/* Total Users */}
        <Link
          to="/admin/users"
          className="group bg-white p-5 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total Users
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? '—' : formatNumber(stats?.totalUsers, statsError)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
            <span>Registered candidates & employers</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Employers */}
        <Link
          to="/admin/employers"
          className="group bg-white p-5 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Employers
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? '—' : formatNumber(stats?.totalEmployers, statsError)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
            <span>Registered organizations</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Verified Partners */}
        <Link
          to="/admin/employers?status=verified"
          className="group bg-white p-5 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Verified Partners
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? '—' : formatNumber(stats?.verifiedEmployers, statsError)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
            <span>Verified company profiles</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Active Jobs */}
        <Link
          to="/admin/jobs"
          className="group bg-white p-5 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Active Jobs
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? '—' : formatNumber(stats?.publishedJobs, statsError)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
            <span>Live published listings</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Pending Reports */}
        <Link
          to="/admin/reported-jobs?status=pending"
          className="group bg-white p-5 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Pending Reports
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <AlertOctagon size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? '—' : formatNumber(stats?.pendingReports, statsError)}
              </span>
              {stats?.pendingReports > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                  Action required
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
            <span>Flagged job posts review</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ─── 4. Attention Required & Moderation Queues ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pending Employer Verifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Employer Verifications</h2>
                <p className="text-xs text-slate-500">Pending review and business validation</p>
              </div>
            </div>
            <Link
              to="/admin/employers?status=pending"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : employersError ? (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-[#FEE2E2] rounded-xl border border-red-200 h-full">
                <AlertOctagon size={24} className="text-[#DC2626] mb-2" />
                <h3 className="text-sm font-semibold text-slate-900">Unable to load queue</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Failed to connect to employer service.</p>
                <button onClick={() => fetchDashboardData()} className="text-xs font-medium text-[#DC2626] hover:underline">Retry Connection</button>
              </div>
            ) : pendingEmployers.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">All Employers Reviewed</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  There are currently no new employer verification requests pending in the queue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEmployers.map((emp) => (
                  <div
                    key={emp._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {emp.companyLogo ? (
                        <img
                          src={emp.companyLogo}
                          alt={emp.companyName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-semibold text-xs flex items-center justify-center shrink-0">
                          {getInitials(emp.companyName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {emp.companyName}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {emp.industry || 'Organization'} • {emp.companyEmail || 'No email'}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/admin/employers/${emp._id}`}
                      className="shrink-0 ml-3 inline-flex items-center justify-center gap-1 px-3.5 h-9 bg-white hover:bg-slate-50 text-blue-600 font-medium text-sm rounded-xl border border-slate-200 transition-colors"
                    >
                      <Eye size={14} />
                      <span>Review</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reported Jobs Moderation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reported Jobs Queue</h2>
                <p className="text-xs text-slate-500">User-flagged listings needing moderation</p>
              </div>
            </div>
            <Link
              to="/admin/reported-jobs?status=pending"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reportsError ? (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-[#FEE2E2] rounded-xl border border-red-200 h-full">
                <AlertOctagon size={24} className="text-[#DC2626] mb-2" />
                <h3 className="text-sm font-semibold text-slate-900">Unable to load queue</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Failed to connect to reporting service.</p>
                <button onClick={() => fetchDashboardData()} className="text-xs font-medium text-[#DC2626] hover:underline">Retry Connection</button>
              </div>
            ) : pendingReports.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Moderation Queue Clear</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  There are no pending reports. Platform job listings are in compliance!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.map((rep) => (
                  <div
                    key={rep._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                          {formatReason(rep.reason)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-2 truncate">
                        {rep.jobId?.title || rep.jobTitle || 'Reported Job'}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {rep.companyId?.companyName || rep.companyName || 'Company'}
                      </p>
                    </div>

                    <Link
                      to="/admin/reported-jobs?status=pending"
                      className="shrink-0 ml-2 inline-flex items-center justify-center gap-1 px-3.5 h-9 bg-white hover:bg-slate-50 text-blue-600 font-medium text-sm rounded-xl border border-slate-200 transition-colors"
                    >
                      <span>Review</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Quick Navigation & Module Hub ─────────────────────────────────── */}
      <div>
        <div className="mb-4 px-1">
          <h2 className="text-lg font-semibold text-slate-900">Admin Modules & Management</h2>
          <p className="text-xs text-slate-500">Quick access to all administrative capabilities</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* User Management */}
          <Link
            to="/admin/users"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                User Management
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Manage candidate & employer accounts, reset credentials, and adjust permissions.
              </p>
            </div>
          </Link>

          {/* Employer Verification */}
          <Link
            to="/admin/employers"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Employer Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Verify business authenticity, review company documents, and grant verified status.
              </p>
            </div>
          </Link>

          {/* Job Postings */}
          <Link
            to="/admin/jobs"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Manage Job Posts
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Audit live vacancies, moderate pending submissions, and manage company listings.
              </p>
            </div>
          </Link>

          {/* Categories & Skills */}
          <Link
            to="/admin/categories"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Layers size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Categories & Skills
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Maintain platform industry taxonomy, job roles, and search keyword skill tags.
              </p>
            </div>
          </Link>

          {/* Reported Jobs */}
          <Link
            to="/admin/reported-jobs?status=pending"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-[#FEF3C7] text-[#D97706] rounded-xl flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#D97706] transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#D97706] transition-colors">
                Reported Jobs
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Moderate user-reported jobs, investigate policy violations, and resolve flags.
              </p>
            </div>
          </Link>

          {/* Admin Settings */}
          <Link
            to="/admin/settings"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                <Settings size={20} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                Security & Settings
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                View administrator details, update security credentials, and check system health.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


