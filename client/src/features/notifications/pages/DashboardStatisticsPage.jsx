import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { getEmployerStatistics } from '../../../services/statisticsService.js';

export default function DashboardStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
        setLoading(true);
      }
      setError(null);
      const res = await getEmployerStatistics();
      // Handle wrapped API responses cleanly
      const data = res?.data?.statistics || res?.statistics || res?.data || res;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch employer statistics:', err);
      setStats(null);
      setError(
        "We couldn't load your dashboard statistics right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchStats();
    })();
  }, [fetchStats]);

  // Shows "—" when the request failed (unknown value), the real number when
  // the API succeeded, or 0 only if the API succeeded with a genuine zero count.
  const displayValue = (field) => (error ? '—' : (stats?.[field] ?? 0));

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="mb-1 text-[13px] text-[#475569]">
          <span>Reports</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-[#2563EB]">Dashboard statistics</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard Statistics</h1>
            <p className="mt-0.5 text-[14px] text-[#475569]">
              Overview of active hiring activity and job metrics
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStats(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Real Employer Stat Cards Aligned directly with Backend API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Applications Received"
          value={displayValue('totalApplicationsReceived')}
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Briefcase}
          label="Total Job Posts"
          value={displayValue('totalJobPosts')}
          color="green"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Active Jobs"
          value={displayValue('activeJobs')}
          color="amber"
          loading={loading}
        />
        <StatCard
          icon={XCircle}
          label="Closed Jobs"
          value={displayValue('closedJobs')}
          color="sky"
          loading={loading}
        />
      </div>

      {/* Analytics & Reports - Explicit Coming Soon State */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Clock className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-base font-bold text-[#0F172A]">
            Advanced Analytics & Top Performing Jobs
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3" /> Coming Soon
          </span>
        </div>
        <p className="mx-auto mt-1 max-w-md text-xs text-[#475569]">
          Detailed application trends, profile views, interview scheduling, and top performing job
          post breakdowns are not available yet and will be added in a future update.
        </p>
      </div>
    </div>
  );
}
