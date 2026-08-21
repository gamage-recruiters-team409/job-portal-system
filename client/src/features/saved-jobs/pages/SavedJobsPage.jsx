import { useState, useEffect } from 'react';
import {
  getSavedJobs,
  removeSavedJob,
} from '../../../services/savedJobService.js';
import SavedJobCard from '../../../components/jobs/SavedJobCard.jsx';
import SavedJobListItem from '../../../components/jobs/SavedJobListItem.jsx';
import LoadingState from '../../../components/jobs/LoadingState.jsx';
import EmptyState from '../../../components/jobs/EmptyState.jsx';

/**
 * @file SavedJobsPage.jsx
 * @description Saved Jobs page — search by job title/company name,
 * Card/List view toggle, and saved job removal.
 */
export default function SavedJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('card');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function fetchSavedJobs() {
    setLoading(true);
    setError(null);

    try {
      const data = await getSavedJobs();
      setItems(data ?? []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to load saved jobs. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(jobId) {
    if (!jobId) return;

    try {
      await removeSavedJob(jobId);

      setItems((prev) =>
        prev.filter(
          (item) =>
            (item.jobId ?? item.job?._id) !== jobId
        )
      );
    } catch (err) {
      console.error('Error removing saved job:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to remove saved job.'
      );
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (!normalizedSearch) return true;

    const title =
      item.job?.title?.toLowerCase() ?? '';

    const company =
      item.job?.companyId?.companyName?.toLowerCase() ?? '';

    return (
      title.includes(normalizedSearch) ||
      company.includes(normalizedSearch)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Saved Jobs
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Jobs you've bookmarked to review or remove from your saved list.
        </p>
      </div>

      {/* Search + View Toggle */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[240px] flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company name"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 p-1">
          <button
            type="button"
            onClick={() => setView('card')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'card'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Card
          </button>

          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading your saved jobs…" />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={
            normalizedSearch
              ? 'No saved jobs found'
              : 'No Saved jobs yet'
          }
          message={
            normalizedSearch
              ? `No saved jobs match "${search.trim()}".`
              : 'Jobs you bookmark will show up here so you can find them again later.'
          }
        />
      ) : view === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <SavedJobCard
              key={item._id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <SavedJobListItem
              key={item._id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}