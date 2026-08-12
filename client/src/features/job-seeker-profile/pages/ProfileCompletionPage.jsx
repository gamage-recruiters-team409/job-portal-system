import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMyProfileCompletion } from '../services/jobSeekerProfileService.js';

const SECTION_LABELS = {
  basicProfile: 'Basic profile',
  skills: 'Skills',
  education: 'Education',
  experience: 'Work experience',
  cv: 'CV uploaded',
  profileImage: 'Profile image',
  portfolio: 'Portfolio links',
};

export default function ProfileCompletionPage() {
  const navigate = useNavigate();

  const [completion, setCompletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCompletion() {
      try {
        const result = await getMyProfileCompletion();

        if (active) {
          setCompletion(result);
        }
      } catch (requestError) {
        if (!active) return;

        setError(requestError?.response?.data?.message || 'Unable to load profile completion.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadCompletion();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="text-sm text-slate-500">Loading profile completion...</p>
      </div>
    );
  }

  const percentage = completion?.percentage ?? 0;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Back to profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1 className="text-lg font-bold text-slate-900">Profile completion</h1>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* Completion percentage */}
              <div className="mt-8 flex flex-col items-center">
                <div
                  className="relative flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #2563EB ${percentage * 3.6}deg,
                      #DBEAFE 0deg
                    )`,
                  }}
                >
                  <div className="flex h-[94px] w-[94px] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-blue-600">{percentage}%</span>

                    <span className="mt-0.5 text-[10px] font-medium text-slate-400">Completed</span>
                  </div>
                </div>

                <p className="mt-5 max-w-lg text-center text-sm leading-6 text-slate-500">
                  Complete the remaining sections to strengthen your profile and improve your job
                  opportunities.
                </p>
              </div>

              {/* Completion sections */}
              <div className="mt-8 space-y-3">
                {Object.entries(completion?.sections || {}).map(([section, details]) => (
                  <div
                    key={section}
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {SECTION_LABELS[section] || section}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">Weight: {details.weight}%</p>
                    </div>

                    <span
                      className={[
                        'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                        details.completed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700',
                      ].join(' ')}
                    >
                      {details.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom action */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Back to profile
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
