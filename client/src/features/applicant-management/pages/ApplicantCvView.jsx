import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ArrowLeft,
  Download,
  Mail,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  AlertCircle,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';
import { APPLICATION_STATUSES } from '../../../constants/statuses.js';
import { getApplicantById, getApplicantCv } from '../../../services/applicantService.js';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdfjs worker via CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─── Status Badge Config (Matches ApplicantList / ApplicantDetails) ──────────

const STATUS_CONFIG = {
  [APPLICATION_STATUSES.APPLIED]: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  [APPLICATION_STATUSES.SHORTLISTED]: {
    label: 'Shortlisted',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.SELECTED]: {
    label: 'Selected',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  [APPLICATION_STATUSES.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  [APPLICATION_STATUSES.WITHDRAWN]: {
    label: 'Withdrawn',
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  },
};

// ─── Avatar Helpers (Matches ApplicantDetails) ───────────────────────────────

const AVATAR_PALETTES = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function nameToInitials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function nameToColour(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function ApplicantCvView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicantData, setApplicantData] = useState(null);

  // CV URL & expiry state
  const [cvData, setCvData] = useState(null); // { downloadUrl, expiresAt, fileName }
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState(null);

  // PDF Viewer control states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewContainerRef = useRef(null);

  // Load applicant details and CV link
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setCvError(null);
    setCvData(null);

    try {
      const detailsRes = await getApplicantById(id);
      setApplicantData(detailsRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load applicant details.';
      setError(msg);
      setLoading(false);
      return; // stop if applicant details failed
    }
    setLoading(false);

    // Separate fetch for CV – failures only affect the CV panel, not the whole page
    setCvLoading(true);
    try {
      const cvRes = await getApplicantCv(id);
      setCvData(cvRes.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Failed to load applicant CV.';
      if (status === 404) {
        setCvError('NO_CV_FOUND');
      } else {
        setCvError(msg);
      }
    } finally {
      setCvLoading(false);
    }
  }, [id]);

  // Refresh only the signed CV URL (for expired link refresh)
  const refreshCvUrl = useCallback(async () => {
    if (!id) return;
    setCvLoading(true);
    setCvError(null);
    try {
      const cvRes = await getApplicantCv(id);
      setCvData(cvRes.data);
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message || err.message || 'Failed to refresh CV download URL.';
      if (status === 404) {
        setCvError('NO_CV_FOUND');
      } else {
        setCvError(msg);
      }
    } finally {
      setCvLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      loadData();
    });
  }, [loadData]);

  // Handle PDF document load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setCvError(null);
  };

  // Handle PDF document load error (e.g., link expired, 403, or invalid format)
  const onDocumentLoadError = (err) => {
    console.error('PDF load error:', err);
    setCvError('Preview expired or failed to render. Click refresh to generate a new signed URL.');
  };

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  const zoomOut = () => setScale((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
  const handleScaleSelect = (e) => setScale(parseFloat(e.target.value));

  // Page navigation
  const prevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const nextPage = () => setPageNumber((prev) => Math.min(numPages || 1, prev + 1));

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!previewContainerRef.current) return;
    if (!document.fullscreenElement) {
      previewContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Trigger file download
  const handleDownload = () => {
    if (!cvData?.downloadUrl) return;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (cvData.expiresAt && nowInSeconds >= cvData.expiresAt) {
      setCvError('This download link has expired. Click refresh to generate a new one.');
      return;
    }
    const a = document.createElement('a');
    a.href = cvData.downloadUrl;
    a.download = cvData.fileName || 'Applicant_CV.pdf';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <div className="h-96 rounded-xl bg-gray-200" />
              <div className="h-48 rounded-xl bg-gray-200" />
            </div>
            <div className="lg:col-span-7">
              <div className="h-[600px] rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !applicantData?.application) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Failed to Load Applicant CV</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'Application document not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(`/applicants/${id}`)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applicant Details
        </button>
      </div>
    );
  }

  const { application, jobSeekerProfile } = applicantData;
  const { jobSeeker, job, status, createdAt } = application;
  const name = jobSeeker?.name || 'Applicant';
  const initials = nameToInitials(name);
  const avatarColour = nameToColour(name);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <button
        type="button"
        onClick={() => navigate(`/applicants/${id}`)}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applicant Details
      </button>

      {/* Main Page Title & Top-Right Download Button */}
      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applicant CV</h1>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!cvData?.downloadUrl}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-xs transition hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Download CV
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Applicant Info Panel (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Applicant Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Applicant Information
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <span
                className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${avatarColour}`}
              >
                {initials}
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{jobSeeker?.email || 'Not provided'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{jobSeekerProfile?.location || 'Not provided'}</span>
              </div>
            </div>

            {/* Application details */}
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <div>
                <span className="text-xs text-gray-400">Applied For</span>
                <p className="font-semibold text-gray-900">{job?.title || 'Unknown Job'}</p>
              </div>

              <div>
                <span className="text-xs text-gray-400">Applied Date</span>
                <div className="mt-0.5 flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: About / Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              About / Summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {jobSeekerProfile?.careerSummary || 'No career summary provided.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CV Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-xs">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">CV Preview</h2>
            </div>

            {/* Viewer Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm">
              {/* Zoom controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100 disabled:opacity-40"
                  title="Zoom Out"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <select
                  value={scale}
                  onChange={handleScaleSelect}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={1.0}>100%</option>
                  <option value={1.25}>125%</option>
                  <option value={1.5}>150%</option>
                  <option value={2.0}>200%</option>
                </select>

                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={scale >= 2.0}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100 disabled:opacity-40"
                  title="Zoom In"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={pageNumber <= 1}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100 disabled:opacity-40"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-medium text-gray-600">
                  <span className="font-semibold text-gray-900">{pageNumber}</span> /{' '}
                  {numPages || '--'}
                </span>

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={!numPages || pageNumber >= numPages}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100 disabled:opacity-40"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Fullscreen toggle & refresh */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshCvUrl}
                  disabled={cvLoading}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100 disabled:opacity-40"
                  title="Refresh Link"
                >
                  <RotateCw className={`h-4 w-4 ${cvLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-xs transition hover:bg-gray-100"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Preview Container */}
            <div
              ref={previewContainerRef}
              className={`relative flex min-h-[500px] max-h-[750px] overflow-auto bg-gray-300/60 p-4 justify-center items-start ${
                isFullscreen ? 'bg-gray-900 p-8 max-h-screen h-screen' : ''
              }`}
            >
              {cvLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
                  <RotateCw className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-sm font-medium text-gray-700">Loading CV Preview...</p>
                </div>
              )}

              {cvError === 'NO_CV_FOUND' ? (
                <div className="my-auto flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-xs max-w-md">
                  <FileText className="h-10 w-10 text-gray-400" />
                  <h3 className="mt-3 text-base font-semibold text-gray-900">No CV Uploaded</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    This applicant has not uploaded a CV. No actions available.
                  </p>
                </div>
              ) : cvError ? (
                <div className="my-auto flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-xs max-w-md">
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                  <h3 className="mt-3 text-base font-semibold text-gray-900">
                    Preview Expired or Unavailable
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{cvError}</p>
                  <button
                    type="button"
                    onClick={refreshCvUrl}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Refresh Preview Link
                  </button>
                </div>
              ) : cvData?.downloadUrl ? (
                <Document
                  file={cvData.downloadUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <FileText className="h-10 w-10 animate-bounce text-blue-500" />
                      <p className="mt-2 text-sm font-medium">Fetching PDF document...</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                    className="shadow-lg rounded-sm overflow-hidden bg-white"
                  />
                </Document>
              ) : (
                <div className="my-auto flex flex-col items-center justify-center p-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm font-medium">No CV file found for this applicant.</p>
                </div>
              )}
            </div>

            {/* Bottom Tip Bar */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
              ★ Tip: Use the controls above to zoom, navigate pages, or download the CV.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
