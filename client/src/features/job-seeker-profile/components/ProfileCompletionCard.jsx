const SECTION_LABELS = {
  basicProfile: 'Personal details',
  skills: 'Skills',
  education: 'Education',
  experience: 'Experience',
  cv: 'CV uploaded',
  profileImage: 'Profile image',
  portfolio: 'Portfolio links',
};

export default function ProfileCompletionCard({ completion, onViewDetails }) {
  const percentage = completion?.percentage ?? 0;
  const sections = Object.entries(completion?.sections || {});

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Profile completion</h2>
      </div>

      <div className="p-5">
        <div className="flex justify-center">
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#2563EB ${percentage * 3.6}deg, #DBEAFE 0deg)`,
            }}
          >
            <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-blue-600">{percentage}%</span>

              <span className="text-[10px] font-medium text-slate-400">Completed</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {sections.map(([key, details]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className={[
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  details.completed
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600',
                ].join(' ')}
              >
                {details.completed ? '✓' : '!'}
              </span>

              <span className="min-w-0 flex-1 text-xs text-slate-600">
                {SECTION_LABELS[key] || key}
              </span>
            </div>
          ))}
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="mt-5 w-full rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            View completion details
          </button>
        )}
      </div>
    </section>
  );
}
