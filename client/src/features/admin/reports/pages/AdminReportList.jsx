/**
 * @file AdminReportList.jsx
 * @description List view of all reported jobs for admin moderation.
 * @module Admin/Reports
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Search,
  ArrowRight,
} from 'lucide-react';
import { getAdminReports } from '../../../../services/adminReport.service';
import AdminReportDetails from './AdminReportDetails';

/* ─── AdminReportList ──────────────────────────────────────────────────────── */

const AdminReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;
        const data = await getAdminReports(params);
        if (isMounted) {
          if (data.data.reports.length === 0 && page > 1) {
            setPage((p) => p - 1);
          } else {
            setReports(data.data.reports);
            setTotalPages(data.data.totalPages);
            setTotalReports(data.data.total);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch reports');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReports();
    return () => {
      isMounted = false;
    };
  }, [page, limit, statusFilter, searchQuery, refreshTrigger]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    switch (normalizedStatus) {
      case 'pending':
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 ' +
              'text-amber-600 text-xs font-medium '
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            Pending
          </span>
        );
      case 'under_review':
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 ' +
              'text-blue-600 text-xs font-medium '
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Under Review
          </span>
        );
      case 'resolved':
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 ' +
              'text-green-600 text-xs font-medium '
            }
          >
            <CheckCircle size={14} />
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 ' +
              'text-slate-600 text-xs font-medium '
            }
          >
            <X size={14} />
            Dismissed
          </span>
        );
      default:
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 ' +
              'text-slate-600 text-xs font-medium '
            }
          >
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Reported Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and moderate jobs reported by users.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={
            'bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex ' + 'flex-col gap-2 '
          }
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Total Reports
            </h3>
            <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <AlertOctagon size={24} />
            </span>
          </div>
          <span className="text-3xl font-bold text-slate-900">{totalReports}</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            className={
              'w-full h-11 pl-10 pr-4 bg-white border border-slate-200 ' +
              'rounded-xl text-sm text-slate-900 focus:outline-none ' +
              'focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm'
            }
            placeholder="Search by job title, company..."
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Tabs */}
        <div className="w-full min-w-0 flex md:justify-end">
          <div
            className={
              'flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 ' +
              'rounded-xl overflow-x-auto max-w-full'
            }
          >
            {[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'dismissed', label: 'Dismissed' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange({ target: { value: status.value } })}
                className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  statusFilter === status.value
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border ' +
                      'border-transparent'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[280px]"
              >
                <div className="p-5 pb-4 flex justify-between items-start">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 animate-pulse flex-shrink-0"></div>
                  <div className="w-20 h-6 rounded-full bg-slate-100 animate-pulse"></div>
                </div>
                <div className="px-5 flex-1 flex flex-col gap-3">
                  <div className="w-3/4 h-6 rounded-lg bg-slate-100 animate-pulse"></div>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="w-1/2 h-4 rounded-lg bg-slate-100 animate-pulse"></div>
                    <div className="w-1/3 h-3 rounded-lg bg-slate-100 animate-pulse"></div>
                  </div>
                  <div className="mt-auto pt-2 pb-5">
                    <div className="w-1/2 h-6 rounded-lg bg-slate-100 animate-pulse"></div>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-4">
                  <div className="w-full h-11 rounded-xl bg-slate-100 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={
              'bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center ' +
              'text-red-600 bg-red-50 font-medium '
            }
          >
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div
            className={
              'bg-white rounded-xl shadow-sm border border-slate-200 flex ' +
              'items-center justify-center p-10 '
            }
          >
            <div className="text-center flex flex-col items-center">
              <CheckCircle size={40} className="text-slate-400 mb-2" />
              <p className="text-slate-500 font-medium">No reports found.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className={
                  'bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ' +
                  'hover:shadow-md transition-shadow '
                }
              >
                {/* Header (Logo + Status) */}
                <div className="p-5 pb-4 flex justify-between items-start">
                  <div
                    className={
                      'w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center ' +
                      'text-blue-600 flex-shrink-0 '
                    }
                  >
                    <Building2 size={24} />
                  </div>
                  <div className="flex-shrink-0 ml-4">{getStatusBadge(report.status)}</div>
                </div>

                {/* Body (Job Details & Reason) */}
                <div className="px-5 flex-1 flex flex-col gap-1">
                  <h3
                    className="text-lg font-bold text-slate-900 line-clamp-1"
                    title={report.jobId?.title || report.jobTitle}
                  >
                    {report.jobId?.title || report.jobTitle}
                  </h3>

                  <div className="flex flex-col gap-0.5 mb-3">
                    <span className="text-sm text-slate-600 font-medium line-clamp-1">
                      {report.companyId?.companyName || report.companyName || 'Unknown Company'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported on{' '}
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="mt-auto pt-2 pb-5">
                    <span
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border ' +
                        'border-red-100 text-red-700 text-xs font-semibold '
                      }
                    >
                      <ShieldAlert size={14} />
                      {report.reason.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Footer (Actions) */}
                <div className="border-t border-slate-100 p-4">
                  <button
                    onClick={() => setSelectedReportId(report._id)}
                    className={
                      'w-full h-11 bg-blue-600 text-white rounded-xl text-sm font-medium ' +
                      'hover:bg-blue-800 transition-colors flex items-center justify-center ' +
                      'gap-2 shadow-sm '
                    }
                  >
                    <ArrowRight size={18} />
                    Review Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && reports.length > 0 && (
          <div className="flex items-center justify-between pt-4 pb-8">
            <span className="text-sm text-slate-500">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  'w-11 h-11 bg-white rounded-xl border border-slate-200 flex ' +
                  'items-center justify-center text-slate-500 hover:bg-slate-50 ' +
                  'transition-colors disabled:opacity-50 shadow-sm '
                }
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  'w-11 h-11 bg-white rounded-xl border border-slate-200 flex ' +
                  'items-center justify-center text-slate-500 hover:bg-slate-50 ' +
                  'transition-colors disabled:opacity-50 shadow-sm '
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedReportId && (
        <div
          className={
            'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
            'bg-slate-900/50 backdrop-blur-sm '
          }
        >
          <AdminReportDetails
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
            onSuccess={() => {
              setSelectedReportId(null);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminReportList;
