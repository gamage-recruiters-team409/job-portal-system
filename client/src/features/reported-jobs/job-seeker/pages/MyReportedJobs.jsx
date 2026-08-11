import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReports } from '../../../../services/reportService.js';
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];
const STATUS_STYLES = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  under_review: { label: 'Under Review', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  dismissed: { label: 'Dismissed', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};
function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
    >
      {' '}
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} /> {style.label}{' '}
    </span>
  );
}
function ReportedJobCard({ job, onView }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {' '}
      <div className="flex items-start justify-between gap-3">
        {' '}
        <div>
          {' '}
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>{' '}
          {job.company && <p className="mt-0.5 text-sm text-gray-500">{job.company}</p>}{' '}
          <p className="mt-2 text-sm text-gray-400"> Reported on {job.reportedOn} </p>{' '}
        </div>{' '}
        <StatusBadge status={job.status} />{' '}
      </div>{' '}
      <button
        type="button"
        onClick={() => onView(job)}
        className="mt-5 w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
      >
        {' '}
        View{' '}
      </button>{' '}
    </div>
  );
}
export default function MyReportedJobs() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getMyReports();
        const reportData = response?.data || [];
        setReports(reportData);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load your reported jobs. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, []);
  const visibleReports =
    activeFilter === 'all' ? reports : reports.filter((report) => report.status === activeFilter);
  const handleView = (report) => {
    navigate(`/report-details/${report._id}`);
  };
  return (
    <div className="p-8">
      {' '}
      <h1 className="text-3xl font-bold text-gray-900">My Reported Jobs</h1>{' '}
      <p className="mt-1 text-gray-500"> View all reports you have submitted. </p>{' '}
      {/* Filter Tabs */}{' '}
      <div className="mt-6 flex flex-wrap gap-3">
        {' '}
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {' '}
              {filter.label}{' '}
            </button>
          );
        })}{' '}
      </div>{' '}
      {/* Loading */}{' '}
      {isLoading && (
        <div className="mt-16 text-center text-sm text-gray-500"> Loading your reports... </div>
      )}{' '}
      {/* Error */}{' '}
      {!isLoading && error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {' '}
          {error}{' '}
        </div>
      )}{' '}
      {/* Report Cards */}{' '}
      {!isLoading && !error && visibleReports.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {' '}
          {visibleReports.map((report) => (
            <ReportedJobCard
              key={report._id}
              job={{
                id: report._id,
                title: report.jobTitle,
                company: report.companyName,
                reportedOn: report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A',
                status: report.status,
              }}
              onView={() => handleView(report)}
            />
          ))}{' '}
        </div>
      )}{' '}
      {/* Empty State */}{' '}
      {!isLoading && !error && visibleReports.length === 0 && (
        <div className="mt-16 text-center text-gray-400"> No reports in this category yet. </div>
      )}{' '}
    </div>
  );
}
