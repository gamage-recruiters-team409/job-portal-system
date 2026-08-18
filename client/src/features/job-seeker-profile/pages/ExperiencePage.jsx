import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import {
  addMyExperience,
  deleteMyExperience,
  getMyProfile,
  updateMyExperience,
} from '../services/jobSeekerProfileService.js';

import { experienceFormSchema } from '../validations/experience.validation.js';

const EMPTY_FORM = {
  organization: '',
  rolePosition: '',
  startDate: '',
  endDate: '',
  isCurrentRole: false,
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

function formatExperienceDate(value) {
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

export default function ExperiencePage() {
  const navigate = useNavigate();

  const [experience, setExperience] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const isCurrentRole = useWatch({
    control,
    name: 'isCurrentRole',
    defaultValue: false,
  });

  useEffect(() => {
    if (isCurrentRole) {
      setValue('endDate', '', {
        shouldValidate: true,
      });
    }
  }, [isCurrentRole, setValue]);

  useEffect(() => {
    let active = true;

    async function loadExperience() {
      try {
        setIsLoading(true);
        setLoadError('');

        const profile = await getMyProfile();

        if (!active) {
          return;
        }

        setExperience(Array.isArray(profile?.experience) ? profile.experience : []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.response?.status === 404) {
          setExperience([]);
        } else {
          setLoadError(
            requestError?.response?.data?.message || 'Unable to load your experience details.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadExperience();

    return () => {
      active = false;
    };
  }, []);

  function clearNotifications() {
    setSaveError('');
    setDeleteError('');
    setSuccessMessage('');
    setDeleteSuccessMessage('');
  }

  function openAddForm() {
    clearNotifications();
    setEditingEntry({});
    reset(EMPTY_FORM);
  }

  function openEditForm(entry) {
    clearNotifications();
    setEditingEntry(entry);

    reset({
      organization: entry.organization || '',
      rolePosition: entry.rolePosition || '',
      startDate: formatDateForInput(entry.startDate),
      endDate: entry.isCurrentRole ? '' : formatDateForInput(entry.endDate),
      isCurrentRole: Boolean(entry.isCurrentRole),
      description: entry.description || '',
    });
  }

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    setEditingEntry(null);
    setSaveError('');
    reset(EMPTY_FORM);
  }

  function openDeleteDialog(entry) {
    clearNotifications();
    setDeleteEntry(entry);
  }

  function closeDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteEntry(null);
    setDeleteError('');
  }

  async function submitExperience(values) {
    try {
      setSaveError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      const currentRole = Boolean(values.isCurrentRole);

      const payload = {
        organization: values.organization.trim(),
        rolePosition: values.rolePosition.trim(),
        startDate: values.startDate,
        endDate: currentRole ? null : values.endDate || null,
        isCurrentRole: currentRole,
        description: values.description.trim(),
      };

      if (editingEntry?._id) {
        const updatedEntry = await updateMyExperience(editingEntry._id, payload);

        setExperience((current) =>
          current.map((entry) => (entry._id === editingEntry._id ? updatedEntry : entry))
        );

        setSuccessMessage('Experience entry updated successfully.');
      } else {
        const createdEntry = await addMyExperience(payload);

        setExperience((current) => [...current, createdEntry]);

        setSuccessMessage('Experience entry added successfully.');
      }

      setEditingEntry(null);
      reset(EMPTY_FORM);
    } catch (requestError) {
      setSaveError(requestError?.response?.data?.message || 'Unable to save the experience entry.');
    }
  }

  async function confirmDelete() {
    if (!deleteEntry?._id || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      await deleteMyExperience(deleteEntry._id);

      setExperience((current) => current.filter((entry) => entry._id !== deleteEntry._id));

      setDeleteEntry(null);
      setDeleteError('');

      setDeleteSuccessMessage('Experience entry deleted successfully.');
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message ||
          'Unable to delete the experience entry. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading experience...</p>
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
                <h1 className="text-lg font-bold text-slate-900">Experience</h1>

                <p className="mt-0.5 text-xs text-slate-400">
                  {experience.length} {experience.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              + Add Experience
            </button>
          </div>

          <div className="p-6">
            {/* Add/Edit success message - GREEN */}
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* Delete success message - RED */}
            {deleteSuccessMessage && (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="status"
              >
                <p>{deleteSuccessMessage}</p>

                <button
                  type="button"
                  onClick={() => setDeleteSuccessMessage('')}
                  aria-label="Dismiss delete success message"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-100 hover:text-red-800"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {experience.length > 0 ? (
              <div className="space-y-4">
                {experience.map((entry) => {
                  const startDate = formatExperienceDate(entry.startDate);

                  const endDate = entry.isCurrentRole
                    ? 'Present'
                    : formatExperienceDate(entry.endDate);

                  return (
                    <article key={entry._id} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold text-slate-900">
                            {entry.rolePosition}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {entry.organization}
                          </p>

                          {startDate && (
                            <p className="mt-2 text-xs text-slate-400">
                              {startDate}
                              {endDate ? ` – ${endDate}` : ''}
                            </p>
                          )}

                          {entry.isCurrentRole && (
                            <span className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              Current role
                            </span>
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
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteDialog(entry)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
                    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M3 12h18" />
                  </svg>
                </div>

                <h2 className="mt-4 text-sm font-semibold text-slate-900">
                  No experience details added yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Add your professional experience to strengthen your profile.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Experience
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {editingEntry !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6">
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-form-title"
          >
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <h2 id="experience-form-title" className="text-lg font-bold text-slate-900">
                {editingEntry?._id ? 'Edit experience' : 'Add experience'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(submitExperience)} noValidate>
              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                <div>
                  <label
                    htmlFor="organization"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Organization *
                  </label>

                  <input
                    id="organization"
                    type="text"
                    maxLength={150}
                    {...register('organization')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.organization
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.organization && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.organization.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rolePosition"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Role / Position *
                  </label>

                  <input
                    id="rolePosition"
                    type="text"
                    maxLength={150}
                    {...register('rolePosition')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.rolePosition
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.rolePosition && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.rolePosition.message}</p>
                  )}
                </div>

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
                      disabled={isCurrentRole}
                      {...register('endDate')}
                      className={[
                        'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
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

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    {...register('isCurrentRole')}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div>
                    <span className="block text-sm font-medium text-slate-700">
                      I currently work here
                    </span>

                    <span className="mt-0.5 block text-xs text-slate-400">
                      End date is not required for a current role.
                    </span>
                  </div>
                </label>

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

                {saveError && (
                  <div
                    className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    <p>{saveError}</p>

                    <button
                      type="button"
                      onClick={() => setSaveError('')}
                      aria-label="Dismiss form error"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-100 hover:text-red-800"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingEntry?._id
                      ? 'Save changes'
                      : 'Add experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-experience-title"
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
              id="delete-experience-title"
              className="mt-4 text-center text-lg font-semibold text-slate-900"
            >
              Delete experience?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to remove{' '}
              <span className="font-medium text-slate-700">{deleteEntry.rolePosition}</span> at{' '}
              <span className="font-medium text-slate-700">{deleteEntry.organization}</span>? This
              action cannot be undone.
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
                disabled={isDeleting}
                onClick={closeDeleteDialog}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
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
