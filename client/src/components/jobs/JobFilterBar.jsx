import { useState } from 'react';

/**
 * @file JobFilterBar.jsx
 * @description Structured filter controls for the Browse page. Values map
 * directly to the backend /jobs/filter query params. Local draft state; Apply
 * fires `onApply(filters)` and Reset clears back to empty.
 *
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

function ChipGroup({ label, options, selected, onToggle, mapLabel = (o) => o }) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
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

export default function JobFilterBar({ onApply }) {
  const [jobTypes, setJobTypes] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');
  const [postedDate, setPostedDate] = useState('');

  const toggle = (list, setList, value) =>
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  function buildFilters() {
    const f = {};
    if (jobTypes.length === 1) f.jobType = jobTypes[0];
    if (workModes.length === 1) f.workMode = workModes[0];
    if (minSalary !== '') f.minSalary = Number(minSalary);
    if (maxSalary !== '') f.maxSalary = Number(maxSalary);
    if (minExp !== '') f.minExperience = Number(minExp);
    if (maxExp !== '') f.maxExperience = Number(maxExp);
    if (postedDate) f.postedDate = postedDate;
    return f;
  }

  function reset() {
    setJobTypes([]);
    setWorkModes([]);
    setMinSalary('');
    setMaxSalary('');
    setMinExp('');
    setMaxExp('');
    setPostedDate('');
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="grid gap-6 md:grid-cols-3">
        <ChipGroup
          label="Job type"
          options={JOB_TYPES}
          selected={jobTypes}
          onToggle={(v) => toggle(jobTypes, setJobTypes, v)}
          mapLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <ChipGroup
          label="Work mode"
          options={WORK_MODES}
          selected={workModes}
          onToggle={(v) => toggle(workModes, setWorkModes, v)}
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
