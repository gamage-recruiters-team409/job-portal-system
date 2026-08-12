/**
 * @file Pagination.jsx
 * @description Prev/next + page-number controls driven by the backend
 * pagination object: { page, limit, total, totalPages }.
 *
 * @param {object} pagination — the backend pagination object.
 * @param {function} onPageChange — called with the new 1-indexed page number.
 */
export default function Pagination({ pagination = {}, onPageChange }) {
  const { page = 1, totalPages = 1, total = 0 } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btn =
    'flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
  const idle = 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50';
  const active = 'border-blue-600 bg-blue-600 text-white';

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className={`${btn} ${idle}`}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? active : idle}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className={`${btn} ${idle}`}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>

      <span className="ml-2 text-sm text-slate-500">{total} job{total === 1 ? '' : 's'}</span>
    </nav>
  );
}
