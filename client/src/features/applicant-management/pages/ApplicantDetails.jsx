import { useNavigate, useParams } from 'react-router-dom';

/**
 * ApplicantDetails — placeholder page.
 *
 * The full details view is delivered in a separate branch. This stub exists
 * solely so that navigating to /applicants/:id from the ApplicantList "View"
 * button has a valid destination and does not 404.
 *
 * TODO: Replace this entire file with the real details component once the
 * applicant-details branch is merged.
 */
export default function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
      {/* Icon */}
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </span>

      <h1 className="text-xl font-bold text-gray-800">Applicant Details</h1>
      <p className="max-w-sm text-sm text-gray-500">
        The full details view is coming in the next branch. This page is a placeholder stub.
      </p>
      {id && (
        <p className="rounded-md bg-gray-100 px-3 py-1 font-mono text-xs text-gray-500">
          ID: {id}
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate('/applicants')}
        className="mt-2 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Applicant List
      </button>
    </div>
  );
}
