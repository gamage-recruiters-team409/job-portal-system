import { useState } from 'react';

/**
 * @file JobFilterBar.jsx
 * @description Structured filter controls for the Browse page. Values map
 * directly to the backend /jobs/filter query params.
 *
 * The component is CONTROLLED by the parent's active filter state (`values`),
 * which itself derives from the URL — so the URL is the single source of truth.
 * The parent remounts this component (via a `key` from the filter values) when
 * the URL changes, so an external change (e.g. "Clear all filters") resets the
 * controls too. `Apply` fires `onApply(filters)`; `Reset` clears the controls
 * and applies an empty filter set (also clearing the URL).
 *
 * @param {object} values — active filters from the URL:
 *   { jobType, workMode, minSalary, maxSalary, minExperience, maxExperience, postedDate }
 * @param {function} onApply — called with the active filters object.
 */
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const WORK_MODES = ['on-site', 'remote', 'hybrid'];
const POSTED = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

const inputCls =
  'h-11 rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-600';
const labelCls = 'text-xs font-medium text-slate-500';

// Single-select chip group: exactly one option (or none) is active, matching
// the backend's single jobType / workMode contract.
function ChipGroup({ label, options, value, onChange, mapLabel = (o) => o }) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mapLabel(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper to coerce a value from the URL (string or ''/null) into the local
// draft's expected string shape.
const str = (v) => (v == null ? '' : String(v));

export default function JobFilterBar({ values = {}, onApply }) {
  const [jobType, setJobType] = useState(str(values.jobType));
  const [workMode, setWorkMode] = useState(str(values.workMode));
  const [minSalary, setMinSalary] = useState(str(values.minSalary));
  const [maxSalary, setMaxSalary] = useState(str(values.maxSalary));
  const [minExp, setMinExp] = useState(str(values.minExperience));
  const [maxExp, setMaxExp] = useState(str(values.maxExperience));
  const [postedDate, setPostedDate] = useState(str(values.postedDate));

  // Toggle a single-select value: selecting the active chip clears it.
  const toggleSingle = (current, setValue, value) => setValue(current === value ? '' : value);

  function buildFilters() {
    const f = {};
    if (jobType) f.jobType = jobType;
    if (workMode) f.workMode = workMode;
    if (minSalary !== '') f.minSalary = Number(minSalary);
    if (maxSalary !== '') f.maxSalary = Number(maxSalary);
    if (minExp !== '') f.minExperience = Number(minExp);
    if (maxExp !== '') f.maxExperience = Number(maxExp);
    if (postedDate) f.postedDate = postedDate;
    return f;
  }

  function reset() {
    setJobType('');
    setWorkMode('');
    setMinSalary('');
    setMaxSalary('');
    setMinExp('');
    setMaxExp('');
    setPostedDate('');
    // Clear the applied filters (and the URL) as well, so the controls and the
    // active results stay in sync.
    onApply({});
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="grid gap-6 md:grid-cols-3">
        <ChipGroup
          label="Job type"
          options={JOB_TYPES}
          value={jobType}
          onChange={(v) => toggleSingle(jobType, setJobType, v)}
          mapLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <ChipGroup
          label="Work mode"
          options={WORK_MODES}
          value={workMode}
          onChange={(v) => toggleSingle(workMode, setWorkMode, v)}
          mapLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <div>
          <p className={labelCls}>Posted</p>
          <select
            value={postedDate}
            onChange={(e) => setPostedDate(e.target.value)}
            className={`${inputCls} mt-2 w-full`}
          >
            <option value="">Any time</option>
            {POSTED.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <div>
          <p className={labelCls}>Min salary (LKR)</p>
          <input type="number" min="0" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} className={`${inputCls} mt-2 w-full`} placeholder="e.g. 100000" />
        </div>
        <div>
          <p className={labelCls}>Max salary (LKR)</p>
          <input type="number" min="0" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} className={`${inputCls} mt-2 w-full`} placeholder="e.g. 300000" />
        </div>
        <div>
          <p className={labelCls}>Min experience (yrs)</p>
          <input type="number" min="0" value={minExp} onChange={(e) => setMinExp(e.target.value)} className={`${inputCls} mt-2 w-full`} placeholder="e.g. 2" />
        </div>
        <div>
          <p className={labelCls}>Max experience (yrs)</p>
          <input type="number" min="0" value={maxExp} onChange={(e) => setMaxExp(e.target.value)} className={`${inputCls} mt-2 w-full`} placeholder="e.g. 8" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onApply(buildFilters())}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
