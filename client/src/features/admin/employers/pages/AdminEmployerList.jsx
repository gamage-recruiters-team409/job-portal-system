/**
 * @file AdminEmployerList.jsx
 * @description List view of all employers for admin verification and management.
 * @module Admin/Employers
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase
} from 'lucide-react';
import {
  getAdminEmployers,
} from '../../../../services/adminEmployer.service';
import { getAdminStatistics } from '../../../../services/statisticsService';
import { EMPLOYER_VERIFICATION_STATUSES } from '../../../../constants/statuses';

/* ─── Helper Functions ─────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getInitials = (name) => {
  if (!name) return 'C';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/* ─── AdminEmployerList Component ──────────────────────────────────────────── */

const AdminEmployerList = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployers, setTotalEmployers] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [stats, setStats] = useState({
    totalEmployers: 0,
    verifiedEmployers: 0,
    publishedJobs: 0,
  });

  // Fetch Employers & Stats
  useEffect(() => {
    let isMounted = true;
    const fetchEmployersAndStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;

        const [employerData, statsData] = await Promise.all([
          getAdminEmployers(params),
          getAdminStatistics().catch(() => null),
        ]);

        if (isMounted) {
          if (employerData?.data?.companies?.length === 0 && page > 1) {
            setPage((p) => p - 1);
          } else if (employerData?.data) {
            setEmployers(employerData.data.companies || []);
            setTotalPages(employerData.data.totalPages || 1);
            setTotalEmployers(employerData.data.total || 0);
          }

          if (statsData) {
            setStats(statsData);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch employers');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployersAndStats();
    
    return () => {
      isMounted = false;
    };
  }, [page, limit, statusFilter, searchQuery, refreshTrigger]);

  /* ─── Handlers ───────────────────────────────────────────────────────────── */

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  /* ─── Render Helpers ─────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] border border-emerald-200/80 text-[#16A34A] text-xs font-semibold shadow-2xs">
            <CheckCircle size={13} className="text-[#16A34A]" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-amber-200/80 text-[#D97706] text-xs font-semibold shadow-2xs">
            <Clock size={13} className="text-[#D97706] animate-pulse" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] border border-red-200/80 text-[#DC2626] text-xs font-semibold shadow-2xs">
            <XCircle size={13} className="text-[#DC2626]" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-xl">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-medium text-slate-900">
            {Math.min(page * limit, totalEmployers)}
          </span>{' '}
          of <span className="font-medium text-slate-900">{totalEmployers}</span> companies
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
                if (
                  pageNumber === page - 2 ||
                  pageNumber === page + 2
                ) {
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
    );
  };

  /* ─── Main Render ────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-medium">Employers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Employers</h1>
          <p className="text-sm text-slate-500 mt-1">Review and verify company profiles.</p>
        </div>
      </div>

      {/* Top 4 Statistics Cards (Powered by Danaja's getAdminStatistics API) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">Total Employers</h3>
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-2xs">
              <Building2 size={18} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 mt-1">
            {stats.totalEmployers ?? totalEmployers}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">Verified Partners</h3>
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shadow-2xs">
              <CheckCircle size={18} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 mt-1">
            {stats.verifiedEmployers ?? 0}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">Pending Review</h3>
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-2xs">
              <Clock size={18} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 mt-1">
            {Math.max(0, (stats.totalEmployers || totalEmployers) - (stats.verifiedEmployers || 0))}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">Total Active Jobs</h3>
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-2xs">
              <Briefcase size={18} />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 mt-1">
            {stats.publishedJobs ?? 0}
          </span>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {/* Filters & Actions */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 w-full justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              className={
                'w-full h-11 pl-10 pr-4 bg-white border border-slate-200 ' +
                'rounded-xl text-sm text-slate-900 focus:outline-none ' +
                'focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm'
              }
              placeholder="Search by company name..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Tabs */}
          <div className="w-full md:w-auto min-w-0 flex md:justify-end">
            <div
              className={
                'flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 ' +
                'rounded-xl overflow-x-auto max-w-full'
              }
            >
              {[
                { value: '', label: 'All' },
                { value: 'verified', label: 'Verified' },
                { value: 'pending', label: 'Pending Review' },
                { value: 'rejected', label: 'Rejected' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                    statusFilter === status.value
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Company Info
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                // Skeleton Loading
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-200"></div>
                        <div className="space-y-2">
                           <div className="h-4 bg-slate-200 rounded w-32"></div>
                           <div className="h-3 bg-slate-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
                      <AlertOctagon size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1">Error Loading Employers</h3>
                    <p className="text-sm text-slate-500">{error}</p>
                    <button
                      onClick={() => setRefreshTrigger((prev) => prev + 1)}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : employers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                    No employers found matching your criteria.
                  </td>
                </tr>
              ) : (
                employers.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/employers/${company._id}`}
                        className="flex items-center gap-3 text-left group"
                      >
                        {company.companyLogo ? (
                          <img
                            src={company.companyLogo}
                            alt={company.companyName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-sm shrink-0 border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                            {getInitials(company.companyName)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {company.companyName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-700">{company.companyEmail}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-500">{formatDate(company.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(company.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/admin/employers/${company._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <Eye size={14} className="text-slate-400" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && !error && employers.length > 0 && renderPagination()}
      </div>
    </div>
  );
};

export default AdminEmployerList;
