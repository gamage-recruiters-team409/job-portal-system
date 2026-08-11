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
const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Report submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];
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
  const statusToIndex = {
    pending: 0,
    under_review: 1,
    resolved: 2,
    dismissed: 3,
  };

  const currentIndex = statusToIndex[status] ?? 0;

  return (
    <div className="flex items-start px-4 pt-2">
      {TIMELINE_STEPS.map((step, index) => {
        const isFinalOutcome = step.key === 'resolved' || step.key === 'dismissed';

        const isDone =
          status === 'dismissed'
            ? step.key === 'submitted' || step.key === 'under_review' || step.key === 'dismissed'
            : status === 'resolved'
              ? step.key === 'submitted' || step.key === 'under_review' || step.key === 'resolved'
              : index <= currentIndex;

        const isLast = index === TIMELINE_STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isDone ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                {isDone && <Check size={16} className="text-white" strokeWidth={3} />}
              </div>

              <span
                className={`mt-2 max-w-[90px] text-center text-sm font-medium ${
                  isDone ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mt-4 h-0.5 flex-1 ${
                  isFinalOutcome
                    ? 'bg-gray-200'
                    : index < currentIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
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
