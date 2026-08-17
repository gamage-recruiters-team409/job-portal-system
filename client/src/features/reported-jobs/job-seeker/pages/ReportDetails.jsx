import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportById } from '../../../../services/reportService.js';
const STATUS_STYLES = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  under_review: { label: 'Under Review', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  dismissed: { label: 'Dismissed', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {' '}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>{' '}
      <div className="mt-4">{children}</div>{' '}
    </div>
  );
}
function InfoRow({ label, value, isLast = false }) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      {' '}
      <span className="text-sm text-gray-500">{label}</span>{' '}
      <span className="text-sm font-medium text-gray-900"> {value || 'N/A'} </span>{' '}
    </div>
  );
}
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
function StatusTimeline({ status }) {
  const statusConfig = {
    pending: {
      color: {
        active: 'border-amber-500 bg-amber-50',
        circle: 'bg-amber-500',
        line: 'bg-amber-400',
        text: 'text-amber-700',
      },
    },

    under_review: {
      color: {
        active: 'border-blue-500 bg-blue-50',
        circle: 'bg-blue-500',
        line: 'bg-blue-400',
        text: 'text-blue-700',
      },
    },

    resolved: {
      color: {
        active: 'border-green-500 bg-green-50',
        circle: 'bg-green-500',
        line: 'bg-green-400',
        text: 'text-green-700',
      },
    },

    dismissed: {
      color: {
        active: 'border-red-500 bg-red-50',
        circle: 'bg-red-500',
        line: 'bg-red-400',
        text: 'text-red-700',
      },
    },
  };

  const steps = [
    {
      key: 'pending',
      label: 'Report Submitted',
      description: 'Your report was submitted',
    },
    {
      key: 'under_review',
      label: 'Under Review',
      description: 'Admin is reviewing your report',
    },
    {
      key: status === 'dismissed' ? 'dismissed' : 'resolved',
      label: status === 'dismissed' ? 'Dismissed' : 'Resolved',
      description:
        status === 'dismissed' ? 'Report was dismissed' : 'Report was resolved successfully',
    },
  ];

  const statusOrder = {
    pending: 0,
    under_review: 1,
    resolved: 2,
    dismissed: 2,
  };

  const currentIndex = statusOrder[status] ?? 0;
  const currentColor = statusConfig[status]?.color || statusConfig.pending.color;

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center
                    rounded-full border-2
                    transition-all duration-500

                    ${
                      completed
                        ? `${currentColor.circle} border-transparent`
                        : active
                          ? `${currentColor.active} animate-pulse`
                          : 'border-gray-300 bg-gray-100'
                    }
                  `}
                >
                  {completed ? (
                    <Check size={22} className="text-white" strokeWidth={3} />
                  ) : active ? (
                    <div
                      className={`
                        h-4 w-4 rounded-full
                        ${currentColor.circle}
                      `}
                    />
                  ) : null}
                </div>

                <p
                  className={`
                    mt-3 text-center text-sm font-semibold

                    ${active ? currentColor.text : completed ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </p>

                <p className="mt-1 max-w-[130px] text-center text-xs text-gray-500">
                  {step.description}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`
                    mx-4 mt-6 h-1 flex-1 rounded-full
                    transition-all duration-700

                    ${index < currentIndex ? currentColor.line : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
export default function ReportDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const loadReport = async () => {
      if (!id) {
        setError('Report ID is missing.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await getReportById(id);
        setReport(response?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [id]);
  const handleBack = () => {
    navigate('/my-reported-jobs');
  };
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        {' '}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          {' '}
          <ArrowLeft size={16} /> Back to My Reports{' '}
        </button>{' '}
        <div className="mt-16 text-center text-sm text-gray-500">
          {' '}
          Loading report details...{' '}
        </div>{' '}
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        {' '}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          {' '}
          <ArrowLeft size={16} /> Back to My Reports{' '}
        </button>{' '}
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {' '}
          {error}{' '}
        </div>{' '}
      </div>
    );
  }
  if (!report) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        {' '}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          {' '}
          <ArrowLeft size={16} /> Back to My Reports{' '}
        </button>{' '}
        <div className="mt-16 text-center text-sm text-gray-500"> Report not found. </div>{' '}
      </div>
    );
  }
  const reportedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : 'N/A';
  return (
    <div className="mx-auto max-w-4xl p-8">
      {' '}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        {' '}
        <ArrowLeft size={16} /> Back to My Reports{' '}
      </button>{' '}
      <div className="mt-6 space-y-6">
        {' '}
        <Section title="Report information">
          {' '}
          <InfoRow label="Report ID" value={report._id} />{' '}
          <InfoRow label="Reported date" value={reportedDate} />{' '}
          <div className="flex items-center justify-between py-3.5">
            {' '}
            <span className="text-sm text-gray-500">Current status</span>{' '}
            <StatusBadge status={report.status} />{' '}
          </div>{' '}
        </Section>{' '}
        <Section title="Job information">
          {' '}
          <InfoRow label="Job title" value={report.jobTitle} />{' '}
          <InfoRow label="Company" value={report.companyName} />{' '}
          <InfoRow label="Job ID" value={report.jobId} isLast />{' '}
        </Section>{' '}
        <Section title="Report reason">
          {' '}
          <InfoRow label="Reason" value={report.reason} />{' '}
          <div className="pt-4">
            {' '}
            <span className="text-sm text-gray-500">Description</span>{' '}
            <p className="mt-2 pl-4 text-sm italic text-gray-700">
              {' '}
              {report.description
                ? `"${report.description}"`
                : 'No additional information provided.'}{' '}
            </p>{' '}
          </div>{' '}
        </Section>{' '}
        <Section title="Status timeline">
          {' '}
          <StatusTimeline status={report.status} />{' '}
        </Section>{' '}
      </div>{' '}
    </div>
  );
}
