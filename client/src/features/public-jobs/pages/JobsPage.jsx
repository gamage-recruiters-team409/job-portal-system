import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listJobs, searchJobs, filterJobs } from '../../../services/jobService.js';
import { getCategories, getSkills } from '../../../services/referenceService.js';
import JobSearchBar from '../../../components/jobs/JobSearchBar.jsx';
import JobFilterBar from '../../../components/jobs/JobFilterBar.jsx';
import JobCard from '../../../components/jobs/JobCard.jsx';
import LoadingState from '../../../components/jobs/LoadingState.jsx';
import EmptyState from '../../../components/jobs/EmptyState.jsx';
import Pagination from '../../../components/jobs/Pagination.jsx';

/**
 * @file JobsPage.jsx
 * @description Main Public Job Discovery page. Supports text search, structured
 * filtering, pagination, and displays published job cards with company branding.
 * Owned by Bimsara.
 */
export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [skillsMap, setSkillsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});

  // Parse query parameters from URL
  const q = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const jobType = searchParams.get('jobType') || '';
  const workMode = searchParams.get('workMode') || '';
  const minSalary = searchParams.get('minSalary') || '';
  const maxSalary = searchParams.get('maxSalary') || '';
  const minExperience = searchParams.get('minExperience') || '';
  const maxExperience = searchParams.get('maxExperience') || '';
  const postedDate = searchParams.get('postedDate') || '';

  // Fetch reference data (skills & categories) for resolving ObjectIds
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [cats, sks] = await Promise.all([
          getCategories().catch(() => []),
          getSkills().catch(() => []),
        ]);
        // Normalise to a { name } shape so consumers use one field. The API
        // returns categoryName / skillName (not `name`).
        const catMap = {};
        cats.forEach((c) => {
          catMap[c._id] = { name: c.categoryName };
        });
        setCategoriesMap(catMap);

        const skMap = {};
        sks.forEach((s) => {
          skMap[s._id] = { name: s.skillName };
        });
        setSkillsMap(skMap);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    }
    loadReferenceData();
  }, []);

  // Fetch jobs based on current URL parameters
  useEffect(() => {
    async function fetchJobsData() {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit: 12 };
        let res;

        // Choose API endpoint based on active filter / search params
        const hasFilters =
          category || jobType || workMode || minSalary || maxSalary || minExperience || maxExperience || postedDate;

        if (hasFilters) {
          if (category) params.category = category;
          if (jobType) params.jobType = jobType;
          if (workMode) params.workMode = workMode;
          if (minSalary) params.minSalary = Number(minSalary);
          if (maxSalary) params.maxSalary = Number(maxSalary);
          if (minExperience) params.minExperience = Number(minExperience);
          if (maxExperience) params.maxExperience = Number(maxExperience);
          if (postedDate) params.postedDate = postedDate;

          res = await filterJobs(params);
        } else if (q || location) {
          if (q) params.q = q;
          if (location) params.location = location;
          res = await searchJobs(params);
        } else {
          res = await listJobs(params);
        }

        setJobs(res.jobs ?? []);
        setPagination(res.pagination ?? {});
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err?.response?.data?.message || 'Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchJobsData();
  }, [q, location, page, category, jobType, workMode, minSalary, maxSalary, minExperience, maxExperience, postedDate]);

  function handleSearch({ q: newQ, location: newLoc }) {
    const next = new URLSearchParams(searchParams);
    if (newQ) next.set('q', newQ);
    else next.delete('q');

    if (newLoc) next.set('location', newLoc);
    else next.delete('location');

    next.set('page', '1');
    setSearchParams(next);
  }

  function handleApplyFilters(filters) {
    const next = new URLSearchParams(searchParams);
    // Clear old filters
    ['category', 'jobType', 'workMode', 'minSalary', 'maxSalary', 'minExperience', 'maxExperience', 'postedDate'].forEach(
      (k) => next.delete(k)
    );

    // Apply new filters
    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && v !== '') {
        next.set(k, String(v));
      }
    });

    next.set('page', '1');
    setSearchParams(next);
  }

  function handlePageChange(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  }

  function handleClearAll() {
    setSearchParams(new URLSearchParams());
  }

  const activeFilterCount = [category, jobType, workMode, minSalary, maxSalary, minExperience, maxExperience, postedDate].filter(
    Boolean
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-lg sm:px-10">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
          Explore Your Next Opportunity
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
          Browse verified job openings from top employers with Gamage Recruiters.
        </p>

        <div className="mt-6">
          <JobSearchBar initial={{ q, location }} onSearch={handleSearch} />
        </div>
      </div>

      {/* Filter Toggle & Info Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Filter Jobs'}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {(activeFilterCount > 0 || q || location) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {pagination.total != null && (
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="font-semibold text-slate-900">{jobs.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.total}</span> jobs
          </p>
        )}
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="mb-8">
          <JobFilterBar onApply={handleApplyFilters} />
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingState label="Searching available jobs…" />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message="No published jobs match your search criteria. Try adjusting your keywords or clearing filters."
          actionLabel="Clear all filters"
          onAction={handleClearAll}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} skillsMap={skillsMap} categoriesMap={categoriesMap} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
