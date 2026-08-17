import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  addMyEducation,
  deleteMyEducation,
  getMyProfile,
  updateMyEducation,
} from '../services/jobSeekerProfileService.js';

import { educationFormSchema } from '../validations/education.validation.js';

const EMPTY_FORM = {
  institutionName: '',
  qualification: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  description: '',
};

function formatDateForInput(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function formatEducationDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

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

export default function EducationPage() {
  const navigate = useNavigate();

  const [education, setEducation] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(educationFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    let active = true;

    async function loadEducation() {
      try {
        setIsLoading(true);
        setLoadError('');

        const profile = await getMyProfile();

        if (!active) return;

        setEducation(Array.isArray(profile?.education) ? profile.education : []);
      } catch (requestError) {
        if (!active) return;

        if (requestError?.response?.status === 404) {
          setEducation([]);
        } else {
          setLoadError(
            requestError?.response?.data?.message || 'Unable to load your education details.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadEducation();

    return () => {
      active = false;
    };
  }, []);

  function clearNotifications() {
    setActionError('');
    setDeleteError('');
    setSuccessMessage('');
    setDeleteSuccessMessage('');
  }

  function openAddForm() {
    setEditingEntry({});
    clearNotifications();

    reset(EMPTY_FORM);
  }

  function openEditForm(entry) {
    setEditingEntry(entry);
    clearNotifications();

    reset({
      institutionName: entry.institutionName || '',
      qualification: entry.qualification || '',
      fieldOfStudy: entry.fieldOfStudy || '',
      startDate: formatDateForInput(entry.startDate),
      endDate: formatDateForInput(entry.endDate),
      description: entry.description || '',
    });
  }

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    setEditingEntry(null);
    setActionError('');
    reset(EMPTY_FORM);
  }

  function closeDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteEntry(null);
    setDeleteError('');
  }

  async function submitEducation(values) {
    try {
      setActionError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      const payload = {
        institutionName: values.institutionName.trim(),
        qualification: values.qualification.trim(),
        fieldOfStudy: values.fieldOfStudy.trim(),
        startDate: values.startDate,
        endDate: values.endDate || null,
        description: values.description.trim(),
      };

      if (editingEntry?._id) {
        const updatedEntry = await updateMyEducation(editingEntry._id, payload);

        setEducation((current) =>
          current.map((entry) => (entry._id === editingEntry._id ? updatedEntry : entry))
        );

        setSuccessMessage('Education entry updated successfully.');
      } else {
        const createdEntry = await addMyEducation(payload);

        setEducation((current) => [...current, createdEntry]);

        setSuccessMessage('Education entry added successfully.');
      }

      setEditingEntry(null);
      reset(EMPTY_FORM);
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message || 'Unable to save the education entry.'
      );
    }
  }

  async function confirmDelete() {
    if (!deleteEntry?._id || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      setActionError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      await deleteMyEducation(deleteEntry._id);

      setEducation((current) => current.filter((entry) => entry._id !== deleteEntry._id));

      setDeleteEntry(null);
      setDeleteError('');

      setDeleteSuccessMessage('Education entry deleted successfully.');
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message ||
          'Unable to delete the education entry. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading education...</p>
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

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                aria-label="Back to profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
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
                <h1 className="text-lg font-bold text-slate-900">Education</h1>

                <p className="mt-0.5 text-xs text-slate-400">
                  {education.length} {education.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              + Add Education
            </button>
          </div>

          <div className="p-6">
            {/* Error banner */}
            {actionError && (
              <div
                className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <p>{actionError}</p>

                <button
                  type="button"
                  onClick={() => setActionError('')}
                  aria-label="Dismiss error message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* Add/Edit success banner */}
            {successMessage && (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                <p>{successMessage}</p>

                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  aria-label="Dismiss success message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* Delete success banner */}
            {deleteSuccessMessage && (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="status"
              >
                <p>{deleteSuccessMessage}</p>

                <button
                  type="button"
                  onClick={() => setDeleteSuccessMessage('')}
                  aria-label="Dismiss delete message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* Education list */}
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((entry) => {
                  const startDate = formatEducationDate(entry.startDate);
                  const endDate = formatEducationDate(entry.endDate);

                  return (
                    <article key={entry._id} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold text-slate-900">
                            {entry.qualification}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {entry.institutionName}
                          </p>

                          {entry.fieldOfStudy && (
                            <p className="mt-1 text-sm text-slate-500">{entry.fieldOfStudy}</p>
                          )}

                          {(startDate || endDate) && (
                            <p className="mt-2 text-xs text-slate-400">
                              {startDate}
                              {startDate && endDate ? ' – ' : ''}
                              {endDate}
                            </p>
                          )}

                          {entry.description && (
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-500">
                              {entry.description}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(entry)}
                            aria-label="Edit education"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              clearNotifications();
                              setDeleteError('');
                              setDeleteEntry(entry);
                            }}
                            aria-label="Delete education"
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m2 10 10-5 10 5-10 5Z" />
                    <path d="M6 12v5c3 2 9 2 12 0v-5" />
                  </svg>
                </div>

                <h2 className="mt-4 text-sm font-semibold text-slate-900">
                  No education details added yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Add your education details to strengthen your professional profile.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Education
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Add/Edit Education form */}
      {editingEntry !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6"
          role="presentation"
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="education-form-title"
          >
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <h2 id="education-form-title" className="text-lg font-bold text-slate-900">
                {editingEntry?._id ? 'Edit education' : 'Add education'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(submitEducation)}>
              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                {/* Institution name */}
                <div>
                  <label
                    htmlFor="institutionName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Institution name *
                  </label>

                  <input
                    id="institutionName"
                    type="text"
                    maxLength={150}
                    {...register('institutionName')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.institutionName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.institutionName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.institutionName.message}</p>
                  )}
                </div>

                {/* Qualification */}
                <div>
                  <label
                    htmlFor="qualification"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Qualification *
                  </label>

                  <input
                    id="qualification"
                    type="text"
                    maxLength={150}
                    {...register('qualification')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.qualification
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.qualification && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.qualification.message}</p>
                  )}
                </div>

                {/* Field of study */}
                <div>
                  <label
                    htmlFor="fieldOfStudy"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Field of study
                  </label>

                  <input
                    id="fieldOfStudy"
                    type="text"
                    maxLength={150}
                    {...register('fieldOfStudy')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.fieldOfStudy
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.fieldOfStudy && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.fieldOfStudy.message}</p>
                  )}
                </div>

                {/* Start Date + End Date */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Start date *
                    </label>

                    <input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className={[
                        'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                        errors.startDate
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                      ].join(' ')}
                    />

                    {errors.startDate && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      End date
                    </label>

                    <input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className={[
                        'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                        errors.endDate
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                      ].join(' ')}
                    />

                    {errors.endDate && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    rows={5}
                    maxLength={1000}
                    {...register('description')}
                    className={[
                      'min-h-[120px] w-full resize-y rounded-lg border px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:ring-2',
                      errors.description
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.description && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Form error */}
                {actionError && (
                  <div
                    className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    <p>{actionError}</p>

                    <button
                      type="button"
                      onClick={() => setActionError('')}
                      aria-label="Dismiss form error"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </div>

              {/* Form actions */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingEntry?._id
                      ? 'Save changes'
                      : 'Add education'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-education-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
              aria-label="Close delete confirmation"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseIcon />
            </button>

            {/* Delete icon */}
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
              </svg>
            </div>

            <h2
              id="delete-education-title"
              className="mt-4 text-center text-lg font-semibold text-slate-900"
            >
              Delete education?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to remove{' '}
              <span className="font-medium text-slate-700">{deleteEntry.qualification}</span>? This
              action cannot be undone.
            </p>

            {/* Delete request failure */}
            {deleteError && (
              <div
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {deleteError}
              </div>
            )}

            {/* Delete actions */}
            <div className="mt-7 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeDeleteDialog}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
