import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEmployerJobs,
  submitJobForReview,
  closeJob,
  reopenJob,
  deleteJob,
} from '../../../services/jobService.js';
import { JOB_STATUSES } from '../../../constants/statuses.js';
import Breadcrumb from '../components/Breadcrumb.jsx';
import CloseJobModal from '../components/CloseJobModal.jsx';
import DeleteJobModal from '../components/DeleteJobModal.jsx';
import ReopenJobModal from '../components/ReopenJobModal.jsx';
import SubmitForReviewModal from '../components/SubmitForReviewModal.jsx';
import JobStatusModal from '../components/JobStatusModal.jsx';
import LoadingState from '../../../components/jobs/LoadingState.jsx';

const STATUS_BADGES = {
  [JOB_STATUSES.DRAFT]: { label: 'Draft', className: 'bg-[#D0D0D0] text-[#000000]' },
  [JOB_STATUSES.PENDING_REVIEW]: {
    label: 'Pending review',
    className: 'bg-[#FFECA2] text-[#C26800]',
  },
  [JOB_STATUSES.PUBLISHED]: { label: 'Active', className: 'bg-[#B8EFCB] text-[#00A33C]' },
  [JOB_STATUSES.CLOSED]: { label: 'Closed', className: 'bg-[#C3D3E7] text-[#1E1E1E]' },
  [JOB_STATUSES.SUSPENDED]: { label: 'Suspended', className: 'bg-[#FEE2E2] text-[#991B1B]' },
  [JOB_STATUSES.REJECTED]: { label: 'Rejected', className: 'bg-[#F1C3C3] text-[#DC2626]' },
};

function getBadge(job) {
  return (
    STATUS_BADGES[job.status] || { label: job.status, className: 'bg-[#F1F5F9] text-[#475569]' }
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ManageJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [busyJobId, setBusyJobId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // { type: 'close'|'delete'|'reopen'|'submit', job }
  const [modalError, setModalError] = useState('');
  const [statusModalJob, setStatusModalJob] = useState(null);
  const messageTimeoutRef = useRef(null);
  const loadRequestIdRef = useRef(0);

  const showTemporaryMessage = (setter, text, duration = 4000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setter(text);
    messageTimeoutRef.current = setTimeout(() => setter(''), duration);
  };

  const loadJobs = async () => {
    const requestId = ++loadRequestIdRef.current;
    try {
      const { data } = await getEmployerJobs();
      if (requestId !== loadRequestIdRef.current) return;
      setJobs(data.jobs || []);
      setIsLoading(false);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      setActionError(error.response?.data?.message || 'Failed to load jobs.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadJobs();
    })();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const runAction = async (jobId, actionFn, successText) => {
    setModalError('');
    setActionError('');
    setActionMessage('');
    setBusyJobId(jobId);
    try {
      await actionFn(jobId);
      showTemporaryMessage(setActionMessage, successText);
      loadJobs();
      return true;
    } catch (error) {
      setModalError(error.response?.data?.message || 'Action failed.');
      return false;
    } finally {
      setBusyJobId(null);
    }
  };

  const openModal = (type, job) => {
    setModalError('');
    setActiveModal({ type, job });
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalError('');
  };

  const confirmSubmitForReview = async () => {
    const jobId = activeModal.job._id;
    const success = await runAction(jobId, submitJobForReview, 'Job submitted for review.');
    if (success) closeModal();
  };

  const confirmClose = async (reason) => {
    const jobId = activeModal.job._id;
    const success = await runAction(jobId, (id) => closeJob(id, reason), 'Job closed.');
    if (success) closeModal();
  };

  const confirmReopen = async (newDeadlineInput) => {
    const jobId = activeModal.job._id;
    setModalError('');
    setBusyJobId(jobId);
    try {
      const deadlineIso = newDeadlineInput ? new Date(newDeadlineInput).toISOString() : undefined;
      await reopenJob(jobId, deadlineIso);
      showTemporaryMessage(setActionMessage, 'Job reopened.');
      loadJobs();
      closeModal();
    } catch (error) {
      setModalError(error.response?.data?.message || 'Failed to reopen job.');
    } finally {
      setBusyJobId(null);
    }
  };

  const confirmDelete = async () => {
    const jobId = activeModal.job._id;
    const success = await runAction(jobId, deleteJob, 'Job deleted.');
    if (success) closeModal();
  };

  const linkClass = 'text-sm font-medium text-[#2563EB] hover:text-[#1E40AF] hover:underline';
  const dangerLinkClass = 'text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] hover:underline';
  const selectClass =
    'rounded-lg border border-[#94A3B8] appearance-none bg-white bg-no-repeat px-3 py-2 pr-10 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]';
  const selectArrowStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    backgroundPosition: 'right 0.75rem center',
  };

  const renderActions = (job) => {
    const disabled = busyJobId === job._id;
    const actions = [
      <button
        key="status"
        type="button"
        className={linkClass}
        onClick={() => setStatusModalJob(job)}
        disabled={disabled}
      >
        Status
      </button>,
      <button
        key="preview"
        type="button"
        className={linkClass}
        onClick={() => window.open(`/jobs/${job._id}/preview`, '_blank')}
        disabled={disabled}
      >
        Preview
      </button>,
    ];

    if (job.status === JOB_STATUSES.DRAFT || job.status === JOB_STATUSES.REJECTED) {
      actions.push(
        <button
          key="edit"
          type="button"
          className={linkClass}
          onClick={() => navigate(`/jobs/${job._id}/edit`)}
          disabled={disabled}
        >
          Edit
        </button>,
        <button
          key="submit"
          type="button"
          className={linkClass}
          onClick={() => openModal('submit', job)}
          disabled={disabled}
        >
          Submit
        </button>,
        <button
          key="delete"
          type="button"
          className={dangerLinkClass}
          onClick={() => openModal('delete', job)}
          disabled={disabled}
        >
          Delete
        </button>
      );
    }

    if (job.status === JOB_STATUSES.PUBLISHED) {
      actions.push(
        <button
          key="close"
          type="button"
          className={linkClass}
          onClick={() => openModal('close', job)}
          disabled={disabled}
        >
          Close
        </button>
      );
    }

    if (job.status === JOB_STATUSES.CLOSED) {
      actions.push(
        <button
          key="reopen"
          type="button"
          className={linkClass}
          onClick={() => openModal('reopen', job)}
          disabled={disabled}
        >
          Reopen
        </button>,
        <button
          key="delete"
          type="button"
          className={dangerLinkClass}
          onClick={() => openModal('delete', job)}
          disabled={disabled}
        >
          Delete
        </button>
      );
    }

    if (actions.length === 0) {
      return <span className="text-sm text-[#94A3B8]">—</span>;
    }

    return <div className="flex flex-wrap gap-3">{actions}</div>;
  };

  return (
    <div className="mx-0 max-w-7xl p-10">
      <Breadcrumb items={[{ label: 'Jobs' }]} />
      <div className="mt-0 flex items-center justify-between">
        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[#000000]">Manage jobs</h1>
        <button
          type="button"
          onClick={() => navigate('/jobs/create')}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E40AF]"
        >
          + Post new job
        </button>
      </div>

      {actionError && (
        <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="mt-4 rounded-lg border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">
          {actionMessage}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search postings"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#94A3B8] py-2 pl-10 pr-9 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#000000]"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
          style={selectArrowStyle}
        >
          <option value="">All statuses</option>
          {Object.values(JOB_STATUSES).map((status) => (
            <option key={status} value={status}>
              {STATUS_BADGES[status]?.label || status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        {isLoading ? (
          <LoadingState label="Loading jobs..." />
        ) : actionError ? null : filteredJobs.length === 0 ? (
          <p className="p-6 text-sm text-[#64748B]">No jobs found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#94A3B8] text-xs uppercase text-[#000000]">
              <tr>
                <th className="px-4 py-3">Job title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const badge = getBadge(job);
                return (
                  <tr key={job._id} className="border-t border-[#E2E8F0]">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{job.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{formatDate(job.deadline)}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-[#475569]">
                      {job.applicationsCount ?? '—'}
                    </td>
                    <td className="px-4 py-3">{renderActions(job)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {activeModal?.type === 'submit' && (
        <SubmitForReviewModal
          jobTitle={activeModal.job.title}
          onConfirm={confirmSubmitForReview}
          onCancel={closeModal}
          isSubmitting={busyJobId === activeModal.job._id}
          error={modalError}
        />
      )}

      {activeModal?.type === 'close' && (
        <CloseJobModal
          jobTitle={activeModal.job.title}
          onConfirm={confirmClose}
          onCancel={closeModal}
          isSubmitting={busyJobId === activeModal.job._id}
          error={modalError}
        />
      )}

      {activeModal?.type === 'reopen' && (
        <ReopenJobModal
          job={activeModal.job}
          onConfirm={confirmReopen}
          onCancel={closeModal}
          isSubmitting={busyJobId === activeModal.job._id}
          error={modalError}
        />
      )}

      {activeModal?.type === 'delete' && (
        <DeleteJobModal
          jobTitle={activeModal.job.title}
          allowed
          onConfirm={confirmDelete}
          onCancel={closeModal}
          isSubmitting={busyJobId === activeModal.job._id}
          error={modalError}
        />
      )}

      {statusModalJob && (
        <JobStatusModal
          job={statusModalJob}
          onClose={() => setStatusModalJob(null)}
          onEdit={() => {
            setStatusModalJob(null);
            navigate(`/jobs/${statusModalJob._id}/edit`);
          }}
          onClosePosting={() => {
            setStatusModalJob(null);
            openModal('close', statusModalJob);
          }}
        />
      )}
    </div>
  );
}
