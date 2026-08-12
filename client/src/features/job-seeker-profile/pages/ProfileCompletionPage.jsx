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

        if (active) setCompletion(result);
      } catch (requestError) {
        if (!active) return;

        setError(requestError?.response?.data?.message || 'Unable to load profile completion.');
      } finally {
        if (active) setIsLoading(false);
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

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Back to profile"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              ←
            </button>

            <h1 className="text-lg font-bold text-slate-900">Profile completion</h1>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-blue-600">
                      {completion?.percentage ?? 0}%
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-lg text-center text-sm text-slate-500">
                  Complete the remaining sections to strengthen your profile and improve your job
                  opportunities.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {Object.entries(completion?.sections || {}).map(([section, details]) => (
                  <div
                    key={section}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {SECTION_LABELS[section] || section}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">Weight: {details.weight}%</p>
                    </div>

                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-medium',
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

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
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
