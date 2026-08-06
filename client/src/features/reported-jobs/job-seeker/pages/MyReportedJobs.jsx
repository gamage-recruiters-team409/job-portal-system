import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];

const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },

  under_review: {
    label: 'Under Review',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },

  resolved: {
    label: 'Resolved',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },

  dismissed: {
    label: 'Dismissed',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

const REPORTED_JOBS = [
  {
    id: 1,
    title: 'Online Data Entry Job',
    company: 'ABC Solutions',
    reportedOn: 'Jul 22, 2026',
    status: 'pending',
  },

  {
    id: 2,
    title: 'Remote Marketing Intern',
    company: 'BrightAds Co',
    reportedOn: 'Jul 18, 2026',
    status: 'under_review',
  },

  {
    id: 3,
    title: 'Data Analyst (Night Shift)',
    company: 'Nova Corp',
    reportedOn: 'Jul 10, 2026',
    status: 'resolved',
  },

  {
    id: 4,
    title: 'Content Writer',
    company: 'WordWave Media',
    reportedOn: 'Jun 30, 2026',
    status: 'dismissed',
  },

  {
    id: 5,
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    reportedOn: 'Aug 02, 2026',
    status: 'pending',
  },

  {
    id: 6,
    title: 'Remote Data Entry Assistant',
    company: '',
    reportedOn: 'Jul 28, 2026',
    status: 'dismissed',
  },
];

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />

      {style.label}
    </span>
  );
}

function ReportedJobCard({ job, onView }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>

          {job.company && <p className="mt-0.5 text-sm text-gray-500">{job.company}</p>}

          <p className="mt-2 text-sm text-gray-400">Reported on {job.reportedOn}</p>
        </div>

        <StatusBadge status={job.status} />
      </div>

      <button
        onClick={() => onView(job)}

        className="mt-5 w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
      >
        View
      </button>
    </div>
  );
}

export default function MyReportedJobs() {
  const [activeFilter, setActiveFilter] = useState('all');

  const navigate = useNavigate();

  const visibleJobs =
    activeFilter === 'all'
      ? REPORTED_JOBS
      : REPORTED_JOBS.filter((job) => job.status === activeFilter);

  const handleView = (job) => {
    navigate(`/report-details/${job.id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">My Reported Jobs</h1>

      <p className="mt-1 text-gray-500">View all reports you have submitted.</p>

      {/* Filter Tabs */}

      <div className="mt-6 flex flex-wrap gap-3">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}

              onClick={() => setActiveFilter(filter.key)}

              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Report Cards */}

      {visibleJobs.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {visibleJobs.map((job) => (
            <ReportedJobCard
              key={job.id}

              job={job}

              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-gray-400">No reports in this category yet.</div>
      )}
    </div>
  );
}
