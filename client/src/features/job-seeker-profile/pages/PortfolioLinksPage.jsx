import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  addMyPortfolioLink,
  deleteMyPortfolioLink,
  getMyProfile,
  updateMyPortfolioLink,
} from '../services/jobSeekerProfileService.js';

import { portfolioFormSchema } from '../validations/portfolio.validation.js';

const EMPTY_FORM = {
  label: '',
  url: '',
};

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

function LinkIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function PortfolioLinksPage() {
  const navigate = useNavigate();

  const [portfolioLinks, setPortfolioLinks] = useState([]);
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    let active = true;

    async function loadPortfolioLinks() {
      try {
        setIsLoading(true);
        setLoadError('');

        const profile = await getMyProfile();

        if (!active) {
          return;
        }

        setPortfolioLinks(Array.isArray(profile?.portfolioLinks) ? profile.portfolioLinks : []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.response?.status === 404) {
          setPortfolioLinks([]);
        } else {
          setLoadError(
            requestError?.response?.data?.message || 'Unable to load your portfolio links.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPortfolioLinks();

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
      label: entry.label || '',
      url: entry.url || '',
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

  async function submitPortfolio(values) {
    try {
      setSaveError('');
      setSuccessMessage('');
      setDeleteSuccessMessage('');

      const payload = {
        label: values.label.trim(),
        url: values.url.trim(),
      };

      if (editingEntry?._id) {
        const updatedEntry = await updateMyPortfolioLink(editingEntry._id, payload);

        setPortfolioLinks((current) =>
          current.map((entry) => (entry._id === editingEntry._id ? updatedEntry : entry))
        );

        setSuccessMessage('Portfolio link updated successfully.');
      } else {
        const createdEntry = await addMyPortfolioLink(payload);

        setPortfolioLinks((current) => [...current, createdEntry]);

        setSuccessMessage('Portfolio link added successfully.');
      }

      setEditingEntry(null);
      reset(EMPTY_FORM);
    } catch (requestError) {
      setSaveError(requestError?.response?.data?.message || 'Unable to save the portfolio link.');
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

      await deleteMyPortfolioLink(deleteEntry._id);

      setPortfolioLinks((current) => current.filter((entry) => entry._id !== deleteEntry._id));

      setDeleteEntry(null);
      setDeleteError('');

      setDeleteSuccessMessage('Portfolio link deleted successfully.');
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message ||
          'Unable to delete the portfolio link. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading portfolio links...</p>
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
                <h1 className="text-lg font-bold text-slate-900">Portfolio Links</h1>

                <p className="mt-0.5 text-xs text-slate-400">
                  {portfolioLinks.length} {portfolioLinks.length === 1 ? 'link' : 'links'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              + Add Portfolio Link
            </button>
          </div>

          <div className="p-6">
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

            {portfolioLinks.length > 0 ? (
              <div className="space-y-4">
                {portfolioLinks.map((entry) => (
                  <article key={entry._id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <LinkIcon />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-base font-semibold text-slate-900">{entry.label}</h2>

                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block break-all text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {entry.url}
                          </a>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Open
                        </a>

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
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <LinkIcon />
                </div>

                <h2 className="mt-4 text-sm font-semibold text-slate-900">
                  No portfolio links added yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Add professional links such as GitHub, LinkedIn, Behance or your personal
                  portfolio.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Portfolio Link
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
            aria-labelledby="portfolio-form-title"
          >
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <h2 id="portfolio-form-title" className="text-lg font-bold text-slate-900">
                {editingEntry?._id ? 'Edit portfolio link' : 'Add portfolio link'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(submitPortfolio)} noValidate>
              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                <div>
                  <label htmlFor="label" className="mb-2 block text-sm font-medium text-slate-700">
                    Label *
                  </label>

                  <input
                    id="label"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. GitHub"
                    {...register('label')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.label
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.label && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.label.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="url" className="mb-2 block text-sm font-medium text-slate-700">
                    Portfolio URL *
                  </label>

                  <input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    {...register('url')}
                    className={[
                      'h-12 w-full rounded-lg border px-3.5 text-sm text-slate-800 outline-none transition focus:ring-2',
                      errors.url
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
                    ].join(' ')}
                  />

                  {errors.url && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.url.message}</p>
                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter the complete URL including http:// or https://.
                  </p>
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
                  {isSubmitting ? 'Saving...' : editingEntry?._id ? 'Save changes' : 'Add link'}
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
            aria-labelledby="delete-portfolio-title"
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
              id="delete-portfolio-title"
              className="mt-4 text-center text-lg font-semibold text-slate-900"
            >
              Delete portfolio link?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to remove{' '}
              <span className="font-medium text-slate-700">{deleteEntry.label}</span>? This action
              cannot be undone.
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
