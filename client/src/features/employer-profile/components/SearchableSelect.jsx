import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

/**
 * Controlled searchable dropdown. Options are `{ value, label }` pairs.
 * When `allowCustom` is true, typing a value with no exact match surfaces a
 * "Use "<query>"" row so free-text fields (e.g. industry) aren't limited to
 * the preset list.
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  error,
  allowCustom = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  // `value` can be a free-text entry that isn't in `options` when allowCustom
  // is set (e.g. a typed Industry). Fall back to showing it directly instead
  // of silently reverting to the placeholder just because there's no preset
  // match.
  const hasValue = Boolean(selectedOption || value);
  const displayLabel = selectedOption ? selectedOption.label : value;

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const exactMatch = options.some((opt) => opt.label.toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setQuery('');
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef}>
      {label && (
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`flex h-11 w-full items-center justify-between rounded-[10px] border bg-slate-50 px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? 'border-[#DC2626]'
              : isOpen
                ? 'border-[#2563EB] ring-1 ring-[#2563EB]'
                : 'border-[#E2E8F0]'
          }`}
        >
          <span className="min-w-0 truncate text-left text-[#64748B]">
            {hasValue ? displayLabel : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#64748B]" />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1.5 w-full rounded-[10px] border border-[#E2E8F0] bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-[#64748B]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                      opt.value === value
                        ? 'bg-blue-50 text-[#2563EB] font-medium'
                        : 'text-[#0F172A]'
                    }`}
                  >
                    <span className="min-w-0 truncate">{opt.label}</span>
                    {opt.value === value && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button>
                </li>
              ))}

              {allowCustom && query.trim() && !exactMatch && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelect(query.trim())}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-[#2563EB] hover:bg-slate-50"
                  >
                    Use &quot;{query.trim()}&quot;
                  </button>
                </li>
              )}

              {filteredOptions.length === 0 && !(allowCustom && query.trim()) && (
                <li className="px-3 py-2 text-sm text-[#64748B]">No matches found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
