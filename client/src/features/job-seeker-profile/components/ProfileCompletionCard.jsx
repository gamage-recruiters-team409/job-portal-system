export default function ProfileCompletionCard({ completion, onViewDetails }) {
  const percentage = completion?.percentage ?? 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Profile completion</h2>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-blue-600">{percentage}%</span>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Complete your profile to improve your job opportunities.
        </p>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View completion details
          </button>
        )}
      </div>
    </section>
  );
}
