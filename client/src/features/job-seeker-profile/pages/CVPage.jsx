import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteMyCv,
  getMyCvDownloadUrl,
  getMyProfile,
  uploadMyCv,
} from '../services/jobSeekerProfileService.js';

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function formatUploadedDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function validateCvFile(file) {
  if (!file) {
    return 'Please select a CV file.';
  }

  if (file.type !== 'application/pdf') {
    return 'Only PDF CV files are allowed.';
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    return 'CV file size cannot exceed 5 MB.';
  }

  return '';
}

export default function CVPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [cv, setCv] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCv() {
      try {
        setIsLoading(true);
        setLoadError('');

        const profile = await getMyProfile();

        if (!active) {
          return;
        }

        setCv(profile?.cv?.publicId ? profile.cv : null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.response?.status === 404) {
          setCv(null);
        } else {
          setLoadError(
            requestError?.response?.data?.message || 'Unable to load your CV information.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadCv();

    return () => {
      active = false;
    };
  }, []);

  function clearNotifications() {
    setUploadError('');
    setDownloadError('');
    setDeleteError('');
    setSuccessMessage('');
    setDeleteSuccessMessage('');
  }

  function selectFile(file) {
    clearNotifications();

    const validationError = validateCvFile(file);

    if (validationError) {
      setSelectedFile(null);
      setFileError(validationError);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    setFileError('');
    setSelectedFile(file);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      selectFile(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      selectFile(file);
    }
  }

  function clearSelectedFile() {
    if (isUploading) {
      return;
    }

    setSelectedFile(null);
    setFileError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) {
      if (!selectedFile) {
        setFileError('Please select a CV file.');
      }

      return;
    }

    const validationError = validateCvFile(selectedFile);

    if (validationError) {
      setFileError(validationError);
      return;
    }

    const wasReplacing = Boolean(cv?.publicId);

    try {
      setIsUploading(true);
      setFileError('');
      setUploadError('');
      setDownloadError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      const uploadedCv = await uploadMyCv(selectedFile);

      setCv(uploadedCv);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccessMessage(wasReplacing ? 'CV replaced successfully.' : 'CV uploaded successfully.');
    } catch (requestError) {
      setUploadError(
        requestError?.response?.data?.message || 'Unable to upload the CV. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload() {
    if (!cv?.publicId || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError('');

      const result = await getMyCvDownloadUrl();

      if (!result?.downloadUrl) {
        setDownloadError('Secure CV download link was not returned.');
        return;
      }

      window.location.assign(result.downloadUrl);
    } catch (requestError) {
      setDownloadError(
        requestError?.response?.data?.message || 'Unable to generate the secure CV download link.'
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function openDeleteDialog() {
    clearNotifications();
    setShowDeleteDialog(true);
  }

  function closeDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setShowDeleteDialog(false);
    setDeleteError('');
  }

  async function confirmDelete() {
    if (!cv?.publicId || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      await deleteMyCv();

      setCv(null);
      setSelectedFile(null);
      setShowDeleteDialog(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setDeleteSuccessMessage('CV removed successfully.');
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message || 'Unable to remove the CV. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading CV information...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">{loadError}</p>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Back to profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uploadedDate = formatUploadedDate(cv?.uploadedAt);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Back to profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">CV Management</h1>

              <p className="mt-0.5 text-xs text-slate-400">Upload and securely manage your CV</p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {successMessage && (
              <div
                className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                <p>{successMessage}</p>

                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  aria-label="Dismiss success message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {deleteSuccessMessage && (
              <div
                className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="status"
              >
                <p>{deleteSuccessMessage}</p>

                <button
                  type="button"
                  onClick={() => setDeleteSuccessMessage('')}
                  aria-label="Dismiss delete success message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-100"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {cv?.publicId && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Current CV</h2>

                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileIcon />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {cv.fileName || 'My CV'}
                        </p>

                        {uploadedDate && (
                          <p className="mt-1 text-xs text-slate-400">Uploaded {uploadedDate}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDownloading ? 'Preparing...' : 'Download'}
                      </button>

                      <button
                        type="button"
                        onClick={openDeleteDialog}
                        disabled={isDeleting}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {downloadError && (
                    <div
                      className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      role="alert"
                    >
                      <p>{downloadError}</p>

                      <button
                        type="button"
                        onClick={() => setDownloadError('')}
                        aria-label="Dismiss download error"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-100 hover:text-red-800"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {cv?.publicId ? 'Replace your CV' : 'Upload your CV'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {cv?.publicId
                  ? 'Choose another PDF to replace your currently uploaded CV.'
                  : 'Add your latest CV so it is available for your job applications.'}
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={[
                  'mt-4 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                  isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50',
                ].join(' ')}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UploadIcon />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-800">
                  Drag and drop your PDF here
                </p>

                <p className="mt-1 text-xs text-slate-400">or</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-3 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Browse files
                </button>

                <p className="mt-3 text-xs text-slate-400">PDF only • Maximum 5 MB</p>
              </div>

              {selectedFile && (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    disabled={isUploading}
                    className="self-start text-xs font-medium text-slate-500 hover:text-red-600 disabled:opacity-60 sm:self-auto"
                  >
                    Remove selection
                  </button>
                </div>
              )}

              {fileError && (
                <div
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {fileError}
                </div>
              )}

              {uploadError && (
                <div
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {uploadError}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedFile) {
                      handleUpload();
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  disabled={isUploading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? 'Uploading...' : cv?.publicId ? 'Replace CV' : 'Upload CV'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showDeleteDialog && cv?.publicId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-cv-title"
          >
            <button
              type="button"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
              aria-label="Close delete confirmation"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseIcon />
            </button>

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FileIcon />
            </div>

            <h2
              id="delete-cv-title"
              className="mt-4 text-center text-lg font-semibold text-slate-900"
            >
              Delete CV?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to remove{' '}
              <span className="font-medium text-slate-700">{cv.fileName || 'your current CV'}</span>
              ? This action cannot be undone.
            </p>

            {deleteError && (
              <div
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-7 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
