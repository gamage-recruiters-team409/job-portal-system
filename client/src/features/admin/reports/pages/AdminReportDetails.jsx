/**
 * @file AdminReportDetails.jsx
 * @description Detailed view modal for a reported job, allowing admins to resolve or suspend the job.
 * @module Admin/Reports
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getAdminReportById, reviewAdminReport } from '../../../../services/adminReport.service';
import { reviewReportSchema } from '../../../../validations/adminReport.schema';
import {
  SuccessFeedbackIcon,
  ErrorFeedbackIcon,
  CloseFeedbackIcon,
} from '../../../../components/common/FeedbackIcons';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  AlertOctagon,
  ShieldAlert,
  Info,
  X,
  CheckCircle2,
  Ban,
  XCircle,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Star,
} from 'lucide-react';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

/* ─── AdminReportDetails ──────────────────────────────────────────────────────── */

const AdminReportDetails = ({ reportId, onClose, onSuccess }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    actionType: null, // 'suspend' | 'dismiss'
    data: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reviewReportSchema),
  });

  useEffect(() => {
    if (!reportId) return;

    let isMounted = true;
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminReportById(reportId);
        if (isMounted) setReport(data.data.report);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch report details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [reportId]);

  const fetchReportStandalone = async () => {
    try {
      setLoading(true);
      const data = await getAdminReportById(reportId);
      setReport(data.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report details');
    } finally {
      setLoading(false);
    }
  };

  const showFeedbackToast = (title, subtitle, type = 'success') => {
    toast.custom(
      (t) => (
        <>
          <style>{`
          @keyframes progress-shrink-${t.id} {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          .animate-progress-shrink-${t.id} {
            animation: progress-shrink-${t.id} 2500ms linear forwards;
          }
        `}</style>
          <div
            className={`${
              t.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } relative max-w-[420px] w-full bg-white shadow-xl shadow-slate-200/50 rounded-2xl pointer-events-auto flex flex-col border border-blue-50/80 transition-all duration-300 overflow-hidden`}
          >
            <div className="flex items-center w-full gap-4 p-4">
              {type === 'success' ? (
                <div
                  className={
                    'flex-shrink-0 w-12 h-12 rounded-full bg-green-100/50 flex items-center ' +
                    'justify-center text-[#16A34A] '
                  }
                >
                  <SuccessFeedbackIcon />
                </div>
              ) : (
                <div
                  className={
                    'flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center ' +
                    'justify-center text-[#DC2626] '
                  }
                >
                  <ErrorFeedbackIcon />
                </div>
              )}
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-slate-800 leading-snug">{title}</p>
                {subtitle && (
                  <p className="mt-0.5 text-[14.5px] text-slate-500 font-medium">{subtitle}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className={
                    'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 ' +
                    'transition-colors text-[#737686] '
                  }
                >
                  <CloseFeedbackIcon />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className={`h-1 w-full origin-left ${type === 'success' ? 'bg-[#4ADE80]' : 'bg-[#DC2626]'} ${t.visible ? `animate-progress-shrink-${t.id}` : ''}`}
            />
          </div>
        </>
      ),
      { duration: 3000 }
    );
  };

  const onReviewSubmit = async (data, actionConfig) => {
    try {
      setIsSubmitting(true);

      const payload = {
        reviewNote: data.reviewNote,
        status: actionConfig.status,
        jobAction: actionConfig.jobAction,
      };

      await reviewAdminReport(reportId, payload);

      showFeedbackToast(
        actionConfig.successTitle || 'Action Successful',
        actionConfig.successMessage,
        'success'
      );

      // Refresh the report data
      await fetchReportStandalone();
      reset(); // clear the text area

      if (onSuccess) onSuccess();
    } catch (err) {
      showFeedbackToast(
        'Action Failed',
        err.response?.data?.message || 'Failed to process action',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div
        className={
          'max-w-3xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-xl ' +
          'text-red-600 text-center flex flex-col items-center '
        }
      >
        <AlertTriangle size={40} className="mb-2" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="mt-2">{error || 'Report not found'}</p>
        <button
          onClick={onClose}
          className={
            'mt-4 h-11 px-6 bg-white border border-red-200 text-red-700 rounded-xl ' +
            'font-medium hover:bg-red-50 transition-colors '
          }
        >
          Close
        </button>
      </div>
    );
  }

  const normalizedStatus = (report.status || '').trim().toLowerCase();
  const isReviewed = ['resolved', 'dismissed'].includes(normalizedStatus);
  
  const isJobSuspendable = 
    report.jobId?.status?.toLowerCase() === 'published' && 
    !report.jobId?.isDeleted;

  return (
    <div
      className={
        'flex flex-col w-full max-w-5xl bg-white rounded-xl shadow-2xl ' +
        'overflow-hidden max-h-[90vh] relative '
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Report Review: {report._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${normalizedStatus === 'pending' || normalizedStatus === 'under_review' ? 'bg-amber-500' : 'bg-slate-400'}`}
            ></span>
            Current Status: {report.status.toUpperCase()}
          </p>
        </div>
        <button
          onClick={onClose}
          className={
            'w-10 h-10 flex items-center justify-center rounded-full ' +
            'hover:bg-slate-100 transition-colors text-slate-400 ' +
            'hover:text-slate-600 '
          }
        >
          <X size={24} />
        </button>
      </div>

      <div className="overflow-y-auto p-6 flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Job Details */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={
                      'w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center ' +
                      'text-blue-600 shrink-0 '
                    }
                  >
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={
                          'px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold '
                        }
                      >
                        Reported Job
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {report.jobId?.title || report.jobTitle}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <Building2 className="shrink-0" size={16} />
                      <span className="line-clamp-1">
                        {report.companyId?.companyName || report.companyName || 'Unknown Company'}
                      </span>
                    </p>
                  </div>
                </div>
                {isJobSuspendable ? (
                  <Link
                    to={`/jobs/${report.jobId?._id || report.jobId}`}
                    target="_blank"
                    className={
                      'text-blue-600 bg-blue-50 sm:bg-transparent sm:hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors ' +
                      'flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto shrink-0 '
                    }
                  >
                    <span className="whitespace-nowrap">View Job Post</span>
                    <ExternalLink size={18} />
                  </Link>
                ) : (
                  <div
                    className={
                      'text-slate-400 bg-slate-50 px-4 py-2 rounded-xl ' +
                      'flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto shrink-0 cursor-not-allowed '
                    }
                    title="Job is no longer published"
                  >
                    <span className="whitespace-nowrap">Job Unavailable</span>
                    <Ban size={18} />
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Key Job Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={
                      'flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100'
                    }
                  >
                    <div
                      className={
                        'w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center ' +
                        'justify-center shrink-0'
                      }
                    >
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {report.jobId?.location || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      'flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100'
                    }
                  >
                    <div
                      className={
                        'w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center ' +
                        'justify-center shrink-0'
                      }
                    >
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Job Type & Mode
                      </p>
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {(report.jobId?.jobType || 'Unknown').replace('_', ' ')} •{' '}
                        {(report.jobId?.workMode || 'Unknown').replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      'flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100'
                    }
                  >
                    <div
                      className={
                        'w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center ' +
                        'justify-center shrink-0'
                      }
                    >
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Salary
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {report.jobId?.salaryMin
                          ? `${report.jobId.salaryCurrency} ${report.jobId.salaryMin.toLocaleString()}` +
                            `${
                              report.jobId.salaryMax
                                ? ` - ${report.jobId.salaryMax.toLocaleString()}`
                                : '+'
                            }`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      'flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100'
                    }
                  >
                    <div
                      className={
                        'w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center ' +
                        'justify-center shrink-0'
                      }
                    >
                      <Star size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Experience
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {report.jobId?.experienceYears !== undefined
                          ? `${report.jobId.experienceYears} Years`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3
                      className={
                        'text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 '
                      }
                    >
                      Job Description
                    </h3>
                    <div
                      className={
                        'p-5 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed ' +
                        'whitespace-pre-wrap border border-slate-100'
                      }
                    >
                      {report.jobId?.description || 'No description available.'}
                    </div>
                  </div>

                  {report.jobId?.responsibilities && (
                    <div>
                      <h3
                        className={
                          'text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 '
                        }
                      >
                        Key Responsibilities
                      </h3>
                      <div
                        className={
                          'p-5 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed ' +
                          'whitespace-pre-wrap border border-slate-100'
                        }
                      >
                        {report.jobId.responsibilities}
                      </div>
                    </div>
                  )}

                  {report.jobId?.requirements && (
                    <div>
                      <h3
                        className={
                          'text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 '
                        }
                      >
                        Requirements & Qualifications
                      </h3>
                      <div
                        className={
                          'p-5 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed ' +
                          'whitespace-pre-wrap border border-slate-100'
                        }
                      >
                        {report.jobId.requirements}
                      </div>
                    </div>
                  )}

                  {report.jobId?.benefits && (
                    <div>
                      <h3
                        className={
                          'text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 '
                        }
                      >
                        Benefits & Perks
                      </h3>
                      <div
                        className={
                          'p-5 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed ' +
                          'whitespace-pre-wrap border border-slate-100'
                        }
                      >
                        {report.jobId.benefits}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Report Details */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div
              className={
                'bg-white rounded-xl shadow-md border-t-4 border-red-600 relative ' +
                'overflow-hidden '
              }
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <AlertOctagon className="text-red-600" size={24} />
                  Report Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <span className="block text-sm font-semibold text-slate-600 mb-1">
                      Reporter
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          'w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ' +
                          'text-blue-700 font-bold '
                        }
                      >
                        {report.reportedBy?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {report.reportedBy?.name}
                        </p>
                        <p className="text-sm text-slate-500">{report.reportedBy?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-slate-600 mb-1">
                      Reason Category
                    </span>
                    <div
                      className={
                        'inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border ' +
                        'border-red-100 rounded-lg '
                      }
                    >
                      <ShieldAlert className="text-red-600" size={18} />
                      <span className="text-sm font-medium text-red-700">
                        {report.reason.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-slate-600 mb-2">
                      Reporter Comments
                    </span>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-800 italic">
                        "{report.description || 'No additional details provided by the reporter.'}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Note Input / Display */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                Internal Moderation Notes
              </h3>

              {isReviewed ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-900">{report.reviewNote}</p>
                  <div
                    className={'mt-2 text-xs font-semibold text-blue-700 uppercase tracking-wider '}
                  >
                    Action Taken: {report.status}
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    {...register('reviewNote')}
                    className={`w-full h-32 p-4 bg-slate-50 rounded-xl resize-none focus:outline-none focus:ring-1 transition-all text-sm text-slate-900 placeholder:text-slate-400 ${
                      errors.reviewNote
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                    }`}
                    placeholder="Mandatory: Add a note before taking action (min 10 characters)..."
                  ></textarea>
                  {errors.reviewNote && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.reviewNote.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar - Only show if NOT reviewed */}
      {!isReviewed && (
        <div
          className={
            'shrink-0 bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col 2xl:flex-row items-start 2xl:items-center ' +
            'justify-between gap-4 '
          }
        >
          <div className="text-slate-500 text-sm font-medium flex items-center gap-2 shrink-0">
            <Info className="shrink-0" size={20} />
            <span>Taking action requires a valid internal note.</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full 2xl:w-auto">
            <button
              disabled={isSubmitting}
              onClick={handleSubmit((data) =>
                setModalConfig({ isOpen: true, actionType: 'dismiss', data })
              )}
              className={
                'h-11 px-6 rounded-xl text-sm font-medium bg-white border ' +
                'border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors ' +
                'flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto '
              }
            >
              <X size={20} />
              <span className="whitespace-nowrap">Dismiss Report</span>
            </button>

            <button
              disabled={isSubmitting || report.status === 'under_review'}
              onClick={handleSubmit((data) =>
                onReviewSubmit(data, {
                  status: 'under_review',
                  jobAction: 'keep',
                  successTitle: 'Under Review',
                  successMessage: 'The report is now marked as under review.',
                })
              )}
              className={`h-11 px-6 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors w-full sm:w-auto ${
                report.status === 'under_review'
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 disabled:opacity-50'
              }`}
            >
              <Eye size={20} />
              <span className="whitespace-nowrap">
                {report.status === 'under_review' ? 'Already Under Review' : 'Under Review'}
              </span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit((data) =>
                onReviewSubmit(data, {
                  status: 'resolved',
                  jobAction: 'keep',
                  successTitle: 'Report Resolved',
                  successMessage: 'No additional moderation action was applied to this job.',
                })
              )}
              className={
                'h-11 px-6 rounded-xl text-sm font-medium border border-blue-600 ' +
                'text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center ' +
                'gap-2 disabled:opacity-50 w-full sm:w-auto '
              }
            >
              <CheckCircle2 size={20} />
              <span className="whitespace-nowrap">Keep Job Post</span>
            </button>

            <button
              disabled={isSubmitting || !isJobSuspendable}
              onClick={handleSubmit((data) =>
                setModalConfig({ isOpen: true, actionType: 'suspend', data })
              )}
              className={`h-11 px-6 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${
                !isJobSuspendable
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50'
              }`}
              title={!isJobSuspendable ? 'Job is no longer published or has been deleted.' : ''}
            >
              <Ban size={20} />
              <span className="whitespace-nowrap">
                {!isJobSuspendable ? 'Job Unavailable' : 'Suspend Job'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, actionType: null, data: null })}
        onConfirm={() => {
          if (modalConfig.actionType === 'suspend') {
            onReviewSubmit(modalConfig.data, {
              status: 'resolved',
              jobAction: 'suspend',
              successTitle: 'Job Suspended',
              successMessage: 'The report is resolved and job is suspended.',
            });
          } else if (modalConfig.actionType === 'dismiss') {
            onReviewSubmit(modalConfig.data, {
              status: 'dismissed',
              jobAction: 'keep',
              successTitle: 'Report Dismissed',
              successMessage: 'The report has been dismissed successfully.',
            });
          }
          setModalConfig({ isOpen: false, actionType: null, data: null });
        }}
        title={modalConfig.actionType === 'suspend' ? 'Suspend Job Post' : 'Dismiss Report'}
        description={
          modalConfig.actionType === 'suspend'
            ? 'Are you sure you want to suspend this job post? Suspending will hide' +
              'the job from the platform and it will no longer be visible to job' +
              'seekers. This action will also resolve the report.'
            : 'Are you sure you want to dismiss this report? No additional moderation ' +
              'action will be applied to this job. This action cannot be undone.'
        }
        confirmText={modalConfig.actionType === 'suspend' ? 'Suspend Job' : 'Dismiss Report'}
        cancelText="Cancel"
        requireCheckbox={modalConfig.actionType === 'suspend'}
        checkboxLabel="I understand the administrative implications of suspending this job post."
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminReportDetails;
