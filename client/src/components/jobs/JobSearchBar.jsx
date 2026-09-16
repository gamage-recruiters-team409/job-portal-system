import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const DEFAULT_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Data Analyst',
  'QA Engineer',
  'Cloud Architect',
  'Project Manager',
  'Machine Learning Engineer',
  'Security Engineer',
  'Business Analyst',
];

/**
 * @file JobSearchBar.jsx
 * @description Keyword (q) + location search inputs with auto-suggestions. On submit it calls
 * `onSearch({ q, location })`. Used by the Home hero and the Browse page.
 *
 * @param {object} [initial] — { q, location } to seed the inputs (e.g. from URL params).
 * @param {function} onSearch — called with { q, location }.
 * @param {string} [placeholder] — keyword placeholder text.
 * @param {string[]} [locations] — optional list of locations for the select.
 * @param {string[]} [suggestions] — optional list of auto-suggestion keywords.
 */
export default function JobSearchBar({
  initial = {},
  onSearch,
  placeholder = 'Job title, keyword…',
  locations = [],
  suggestions = DEFAULT_SUGGESTIONS,
}) {
  const [q, setQ] = useState(initial.q ?? '');
  const [location, setLocation] = useState(initial.location ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  // Compute matching auto-suggestions based on keyword input
  const filteredSuggestions = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(trimmed) && s.toLowerCase() !== trimmed)
      .slice(0, 6);
  }, [q, suggestions]);

  // Dismiss suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectSuggestion(suggestion) {
    setQ(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearch({ q: suggestion, location });
  }

  function handleKeyDown(e) {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
      e.preventDefault();
      handleSelectSuggestion(filteredSuggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearch({ q: q.trim(), location });
  }

  function handleClearQ() {
    setQ('');
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-md sm:flex-row"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (q.trim()) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl bg-slate-50 pl-4 pr-9 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
          autoComplete="off"
        />

        {q && (
          <button
            type="button"
            onClick={handleClearQ}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear keyword search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Auto-suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={suggestion}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Search className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{suggestion}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
