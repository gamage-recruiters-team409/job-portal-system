import { useState } from 'react';

/**
 * @file JobSearchBar.jsx
 * @description Keyword (q) + location search inputs. On submit it calls
 * `onSearch({ q, location })`. Used by the Home hero and the Browse page.
 *
 * @param {object} [initial] — { q, location } to seed the inputs (e.g. from URL params).
 * @param {function} onSearch — called with { q, location }.
 * @param {string} [placeholder] — keyword placeholder text.
 * @param {string[]} [locations] — optional list of locations for the select.
 */
export default function JobSearchBar({ initial = {}, onSearch, placeholder = 'Job title, keyword…', locations = [] }) {
  const [q, setQ] = useState(initial.q ?? '');
  const [location, setLocation] = useState(initial.location ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch({ q: q.trim(), location });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-md sm:flex-row"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-12 flex-1 rounded-xl bg-slate-50 px-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
      />

      {locations.length > 0 ? (
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12 rounded-xl bg-slate-50 px-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:w-48"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="h-12 rounded-xl bg-slate-50 px-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:w-48"
        />
      )}

      <button
        type="submit"
        className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
