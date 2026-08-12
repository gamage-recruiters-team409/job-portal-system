/**
 * @file LoadingState.jsx
 * @description Centered spinner used while a public-jobs request is in flight.
 * Matches the loading style used in the auth pages.
 */
export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
