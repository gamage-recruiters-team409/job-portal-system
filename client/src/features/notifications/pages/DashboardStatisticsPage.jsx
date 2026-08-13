import { useEffect, useState, useCallback } from 'react';
import { FileText, Briefcase, Clock, Eye, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { getEmployerStatistics } from '../../../services/statisticsService.js';

// Status badge styling helper
const STATUS_BADGE_STYLES = {
  Open: 'bg-[#DCFCE7] text-[#16A34A]',
  Interviewing: 'bg-[#FEF3C7] text-[#D97706]',
  Closed: 'bg-slate-200 text-slate-600',
};

// Initial badge background helper
const INITIAL_CHIP_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-amber-100 text-amber-600',
  'bg-sky-100 text-sky-600',
  'bg-indigo-100 text-indigo-600',
];

export default function DashboardStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployerStatistics();
      setStats(data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard statistics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    getEmployerStatistics()
      .then((data) => {
        if (!ignore) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.message || 'Failed to load dashboard statistics. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fallback mock list matching Figma when stats are empty
  const topJobs = stats?.topPerformingJobs || [
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      initials: 'SE',
      applications: 64,
      views: 312,
      status: 'Open',
      postedDate: '2 Jul 2026',
    },
    {
      id: '2',
      title: 'Product Designer',
      initials: 'PD',
      applications: 47,
      views: 265,
      status: 'Open',
      postedDate: '6 Jul 2026',
    },
    {
      id: '3',
      title: 'Backend Engineer',
      initials: 'BE',
      applications: 39,
      views: 198,
      status: 'Interviewing',
      postedDate: '10 Jul 2026',
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      initials: 'DO',
      applications: 28,
      views: 154,
      status: 'Closed',
      postedDate: '14 Jul 2026',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="text-[13px] text-[#475569] mb-1">
          <span>Reports</span>
          <span className="mx-2">/</span>
          <span className="text-[#2563EB] font-medium">Dashboard statistics</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard Statistics</h1>
            <p className="text-[14px] text-[#475569] mt-0.5">
              Overview of hiring activity and platform performance for July 2026
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg shadow-xs hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-[#475569]" />
            <span>Jul 1 - Jul 24, 2026</span>
          </button>
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
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={stats?.totalApplications ?? 248}
          trend="up"
          trendLabel="+12.4%"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Briefcase}
          label="Active job posts"
          value={stats?.activeJobPosts ?? 18}
          trend="up"
          trendLabel="+3%"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Interviews scheduled"
          value={stats?.interviewsScheduled ?? 32}
          trend="down"
          trendLabel="-4.1%"
          color="amber"
          loading={loading}
        />
        <StatCard
          icon={Eye}
          label="Profile views"
          value={stats?.profileViews ?? 1204}
          trend="up"
          trendLabel="+8.9%"
          color="sky"
          loading={loading}
        />
      </div>

      {/* Analytics Row: Trend Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trend Line Chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Application Trend</h3>
                <p className="text-[13px] text-[#475569]">Daily applications received this month</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#0F172A]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                  Applications
                </span>
                <span className="flex items-center gap-1.5 text-[#475569]">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Views
                </span>
              </div>
            </div>
          </div>

          {/* Lightweight SVG Line Visualization */}
          <div className="relative mt-6 h-48 w-full">
            {/* Tooltip Badge */}
            <div className="absolute top-[22%] left-[56%] -translate-x-1/2 rounded-md bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white shadow-md z-10">
              18 Today
            </div>

            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Views Trend (Grey) */}
              <path
                d="M 0 120 Q 80 115, 150 125 T 300 110 T 420 100 L 500 105"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
              />

              {/* Applications Trend (Blue) */}
              <path
                d="M 0 110 L 50 90 L 100 100 L 160 70 L 210 80 L 270 50 L 310 60 L 370 20 L 420 35 L 500 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
              />

              {/* Active Point Dot */}
              <circle cx="283" cy="55" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-Axis Labels */}
            <div className="mt-2 flex justify-between text-[11px] text-[#475569]">
              <span>Jul 1</span>
              <span>Jul 10</span>
              <span>Jul 18</span>
              <span>Jul 24</span>
            </div>
          </div>
        </div>

        {/* Jobs by Status Donut Chart */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Jobs by status</h3>
            <p className="text-[13px] text-[#475569]">18 active job posts</p>
          </div>

          <div className="my-4 flex justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Closed segment (20%) */}
                <path
                  className="text-slate-400"
                  strokeDasharray="20, 100"
                  strokeDashoffset="0"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Interviewing segment (25%) */}
                <path
                  className="text-amber-500"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-20"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Open segment (55%) */}
                <path
                  className="text-[#2563EB]"
                  strokeDasharray="55, 100"
                  strokeDashoffset="-45"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Inner Circle Label */}
              <div className="absolute text-center">
                <span className="block text-xl font-bold text-[#0F172A]">18</span>
                <span className="block text-[11px] text-[#475569]">Total jobs</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#475569]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                Open
              </span>
              <span className="font-semibold text-[#0F172A]">10 (55%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#475569]">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Interviewing
              </span>
              <span className="font-semibold text-[#0F172A]">4 (25%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#475569]">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Closed
              </span>
              <span className="font-semibold text-[#0F172A]">4 (20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Job Posts Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0F172A]">Top performing job posts</h3>
          <button
            type="button"
            className="text-[13px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                <th className="pb-3 pl-2">Job Title</th>
                <th className="pb-3 text-center">Applications</th>
                <th className="pb-3 text-center">Views</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {topJobs.map((job, idx) => (
                <tr key={job.id || idx} className="hover:bg-slate-50/60">
                  <td className="py-4 pl-2 font-medium text-[#0F172A]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                          INITIAL_CHIP_COLORS[idx % INITIAL_CHIP_COLORS.length]
                        }`}
                      >
                        {job.initials}
                      </div>
                      <span>{job.title}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center text-[#0F172A]">{job.applications}</td>
                  <td className="py-4 text-center text-[#0F172A]">{job.views}</td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        STATUS_BADGE_STYLES[job.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2 text-[#475569]">{job.postedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
