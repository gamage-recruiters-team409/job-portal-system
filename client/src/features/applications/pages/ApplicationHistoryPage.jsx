import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApplicationHistory } from '../../../services/applicationService.js';
import LoadingState from '../../../components/jobs/LoadingState.jsx';
import EmptyState from '../../../components/jobs/EmptyState.jsx';

// Backend status values -> friendly display labels + badge colors.
// "selected" is intentionally displayed as "Selected" (not "Approved") —
// confirmed decision, see the development report.
const STATUS_STYLES = {
  applied: { label: 'Applied', className: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700' },
  shortlisted: { label: 'Shortlisted', className: 'bg-yellow-100 text-yellow-800' },
  selected: { label: 'Selected', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ApplicationHistoryPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationHistory();
      setApplications(data ?? []);
    } catch (err) {
      console.error('Error fetching application history:', err);
      setError(
        err?.response?.data?.message || 'Failed to load your applications. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = applications.filter((app) => {
    const title = app.job?.title?.toLowerCase() ?? '';
    const company = app.job?.companyId?.companyName?.toLowerCase() ?? '';
    const matchesSearch =
      !normalizedSearch || title.includes(normalizedSearch) || company.includes(normalizedSearch);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
        <p className="mt-2 text-sm text-slate-500">
          Track every job you've applied to and its current status.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company name"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Status: All</option>
          <option value="applied">Applied</option>
          <option value="under_review">Under Review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading your applications…" />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications yet"
          message="Jobs you apply to will show up here so you can track their status."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => {
                const lastUpdated =
                  app.statusHistory?.[app.statusHistory.length - 1]?.changedAt ?? app.updatedAt;
                return (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {app.job?.title ?? 'Job unavailable'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {app.job?.companyId?.companyName ?? 'Company'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(lastUpdated)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/my-applications/${app._id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
