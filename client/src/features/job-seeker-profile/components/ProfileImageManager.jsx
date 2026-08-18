import { useEffect, useRef, useState } from 'react';

import { deleteMyProfileImage, uploadMyProfileImage } from '../services/jobSeekerProfileService.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return '';
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487 18.55 2.8a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 7.125 16.875 4.5M18 14.25V19.5A1.5 1.5 0 0 1 16.5 21h-12A1.5 1.5 0 0 1 3 19.5v-12A1.5 1.5 0 0 1 4.5 6H9.75"
      />
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.228 5.79 18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.327L4.772 5.79m14.456 0A48.108 48.108 0 0 0 15.75 5.4m-10.978.39A48.11 48.11 0 0 1 8.25 5.4m7.5 0V4.484c0-1.18-.91-2.164-2.09-2.201a52.098 52.098 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201V5.4m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5A1.5 1.5 0 0 0 21.75 18V6A1.5 1.5 0 0 0 20.25 4.5H3.75A1.5 1.5 0 0 0 2.25 6v12A1.5 1.5 0 0 0 3.75 19.5Zm12.75-11.25h.008v.008H15V8.25Z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function ProfileImageManager({
  currentImageUrl = '',
  userName = '',
  onImageChange,
  onFeedback,
}) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [uploadError, setUploadError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const hasSavedImage = Boolean(currentImageUrl);
  const modalImageUrl = previewUrl || currentImageUrl;

  function validateImage(file) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Only PNG and JPEG profile images are allowed.';
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return 'Profile image must be 2 MB or smaller.';
    }

    return '';
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadError('');
  }

  function handleFileSelection(file) {
    if (!file) {
      return;
    }

    const validationMessage = validateImage(file);

    if (validationMessage) {
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadError(validationMessage);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setUploadError('');
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];

    handleFileSelection(file);

    event.target.value = '';
  }

  function openUploadModal() {
    setUploadError('');
    setSelectedFile(null);
    setPreviewUrl('');
    setIsUploadOpen(true);
  }

  function closeUploadModal() {
    if (isUploading) {
      return;
    }

    clearSelectedFile();
    setIsUploadOpen(false);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteError('');
    setIsDeleteOpen(false);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError('Please choose a PNG or JPEG image before uploading.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');

      const wasReplacing = hasSavedImage;
      const profileImage = await uploadMyProfileImage(selectedFile);

      onImageChange?.(profileImage?.imageUrl || '');

      setSelectedFile(null);
      setPreviewUrl('');
      setIsUploadOpen(false);

      onFeedback?.({
        type: 'success',
        message: wasReplacing
          ? 'Profile image replaced successfully.'
          : 'Profile image uploaded successfully.',
      });
    } catch (requestError) {
      setUploadError(
        requestError?.response?.data?.message || 'Unable to upload the profile image.'
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setDeleteError('');

      const profileImage = await deleteMyProfileImage();

      onImageChange?.(profileImage?.imageUrl || '');

      setSelectedFile(null);
      setPreviewUrl('');
      setIsDeleteOpen(false);

      onFeedback?.({
        type: 'delete',
        message: 'Profile image removed successfully.',
      });
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message || 'Unable to remove the profile image.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-start">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-3xl font-semibold text-blue-600">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={userName || 'Profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              (userName || 'U').charAt(0).toUpperCase()
            )}
          </div>

          {/* Edit icon - LEFT */}
          <button
            type="button"
            onClick={openUploadModal}
            aria-label={hasSavedImage ? 'Replace profile image' : 'Upload profile image'}
            title={hasSavedImage ? 'Replace profile image' : 'Upload profile image'}
            className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <PencilIcon />
          </button>

          {/* Delete icon - RIGHT */}
          {hasSavedImage && (
            <button
              type="button"
              onClick={() => {
                setDeleteError('');
                setIsDeleteOpen(true);
              }}
              aria-label="Remove profile image"
              title="Remove profile image"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          )}
        </div>

        <p className="mt-4 max-w-[130px] text-center text-xs leading-4 text-slate-400">
          PNG or JPEG, maximum 2 MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Upload / Replace modal */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-image-upload-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="profile-image-upload-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {hasSavedImage ? 'Replace profile image' : 'Upload profile image'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a PNG or JPEG image up to 2 MB.
                </p>
              </div>

              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                aria-label="Close image upload"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-3xl font-semibold text-blue-600">
                  {modalImageUrl ? (
                    <img
                      src={modalImageUrl}
                      alt="Selected profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (userName || 'U').charAt(0).toUpperCase()
                  )}
                </div>

                {!selectedFile && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-5 flex w-full max-w-sm flex-col items-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-7 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ImageIcon />
                    </span>

                    <span className="mt-3 text-sm font-medium text-slate-700">Choose an image</span>

                    <span className="mt-1 text-xs text-slate-400">PNG or JPEG, maximum 2 MB</span>
                  </button>
                )}

                {selectedFile && (
                  <div className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        disabled={isUploading}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove selection
                      </button>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div
                    className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={selectedFile ? handleUpload : () => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading
                  ? 'Uploading...'
                  : selectedFile
                    ? hasSavedImage
                      ? 'Replace image'
                      : 'Upload image'
                    : 'Choose image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-profile-image-title"
        >
          <div className="relative w-full max-w-md rounded-xl bg-white px-7 pb-7 pt-7 shadow-xl">
            {/* Close X */}
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              aria-label="Close delete confirmation"
              className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseIcon />
            </button>

            {/* Delete icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TrashIcon className="h-5 w-5" />
            </div>

            <div className="mt-5 text-center">
              <h2 id="delete-profile-image-title" className="text-lg font-semibold text-slate-900">
                Delete profile image?
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Are you sure you want to remove your profile image? Your profile initial will be
                shown instead.
              </p>
            </div>

            {deleteError && (
              <div
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
