import { useState, useEffect } from 'react';
import { getSavedJobs, removeSavedJob } from '../../../services/savedJobService.js';
import SavedJobCard from '../../../components/jobs/SavedJobCard.jsx';
import SavedJobListItem from '../../../components/jobs/SavedJobListItem.jsx';
import LoadingState from '../../../components/jobs/LoadingState.jsx';
import EmptyState from '../../../components/jobs/EmptyState.jsx';

/**
 * @file SavedJobsPage.jsx
 * @description Saved Jobs page — search by job title/company name,
 * Card/List view toggle, saved job removal, and bulk-unsave (select
 * multiple jobs and remove them together). Bulk-unsave added per QA
 * report recommendation.
 */
export default function SavedJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('card');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  async function fetchSavedJobs() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavedJobs();
      setItems(data ?? []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(err?.response?.data?.message || 'Failed to load saved jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function handleRemove(jobId) {
    if (!jobId) return;
    try {
      await removeSavedJob(jobId);
      setItems((prev) => prev.filter((item) => (item.jobId ?? item.job?._id) !== jobId));
      setSelectedIds((prev) => prev.filter((id) => id !== jobId));
    } catch (err) {
      console.error('Error removing saved job:', err);
      setError(err?.response?.data?.message || 'Failed to remove saved job.');
    }
  }

  function handleToggleSelect(jobId) {
    setSelectedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }

  function handleToggleSelectAll() {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.jobId ?? item.job?._id));
    }
  }
function handleEnterSelectMode() {
  setIsSelectMode(true);
}

function handleExitSelectMode() {
  setIsSelectMode(false);
  setSelectedIds([]);
}
  async function handleBulkRemove() {
    if (selectedIds.length === 0) return;
    setBulkRemoving(true);
    setError(null);
    try {
      // Remove sequentially so a single failure doesn't abort the rest;
      // each removeSavedJob call is already idempotent/safe per the
      // backend (never blocked even if the Job is no longer valid).
      for (const jobId of selectedIds) {
        await removeSavedJob(jobId);
      }
      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.jobId ?? item.job?._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error('Error removing selected saved jobs:', err);
      setError(err?.response?.data?.message || 'Failed to remove some selected jobs.');
      // Refresh from the server so the list reflects what actually succeeded.
      fetchSavedJobs();
    } finally {
      setBulkRemoving(false);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (!normalizedSearch) return true;
    const title = item.job?.title?.toLowerCase() ?? '';
    const company = item.job?.companyId?.companyName?.toLowerCase() ?? '';
    return title.includes(normalizedSearch) || company.includes(normalizedSearch);
  });

  const allSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;

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
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative w-full flex-1 sm:min-w-[240px] sm:w-auto">
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
              view === 'card' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Selection toolbar */}
{!loading && !error && filteredItems.length > 0 && (
  <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">

    {!isSelectMode ? (
      <button
        type="button"
        onClick={handleEnterSelectMode}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
      >
        Select
      </button>
    ) : (
      <>
        {/* Select All */}
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleSelectAll}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          {allSelected ? 'Deselect all' : 'Select all'}
        </label>

        <div className="flex items-center gap-2">

          {/* Remove Selected */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkRemove}
              disabled={bulkRemoving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkRemoving
                ? 'Removing…'
                : `Remove Selected (${selectedIds.length})`}
            </button>
          )}

          {/* Cancel */}
          <button
            type="button"
            onClick={handleExitSelectMode}
            disabled={bulkRemoving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

        </div>
      </>
    )}

  </div>
)}

      {loading ? (
        <LoadingState label="Loading your saved jobs…" />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={normalizedSearch ? 'No saved jobs found' : 'No Saved jobs yet'}
          message={
            normalizedSearch
              ? `No saved jobs match "${search.trim()}".`
              : 'Jobs you bookmark will show up here so you can find them again later.'
          }
        />
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const jobId = item.jobId ?? item.job?._id;
            return (
              <SavedJobCard
  key={item._id}
  item={item}
  onRemove={handleRemove}
  isSelected={selectedIds.includes(jobId)}
  onToggleSelect={handleToggleSelect}
  isSelectMode={isSelectMode}
/>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => {
            const jobId = item.jobId ?? item.job?._id;
            return (
              <SavedJobListItem
  key={item._id}
  item={item}
  onRemove={handleRemove}
  isSelected={selectedIds.includes(jobId)}
  onToggleSelect={handleToggleSelect}
  isSelectMode={isSelectMode}
/>
            );
          })}
        </div>
      )}
    </div>
  );
}
