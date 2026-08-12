import { Link } from 'react-router-dom';

/**
 * @file EmptyState.jsx
 * @description No-results / empty message with an optional action. The action
 * can be either a navigation Link (provide `actionTo`) or a button callback
 * (provide `onAction`). Used by the browse page (no matching jobs) and job
 * detail (job not found).
 */
export default function EmptyState({ title, message, actionLabel, actionTo, onAction }) {
  const btnCls =
    'mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700';

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        </svg>
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>}
      {onAction ? (
        <button type="button" onClick={onAction} className={btnCls}>
          {actionLabel}
        </button>
      ) : (
        actionLabel &&
        actionTo && (
          <Link to={actionTo} className={btnCls}>
            {actionLabel}
          </Link>
        )
      )}
    </div>
  );
}
