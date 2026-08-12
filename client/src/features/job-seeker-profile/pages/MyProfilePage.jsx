import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';
import {
  getActiveSkills,
  getMyProfile,
  getMyProfileCompletion,
} from '../services/jobSeekerProfileService.js';
import ProfileCompletionCard from '../components/ProfileCompletionCard.jsx';

export default function MyProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError('');

        const [profileResult, completionResult, skillsResult] = await Promise.allSettled([
          getMyProfile(),
          getMyProfileCompletion(),
          getActiveSkills(),
        ]);

        if (!active) return;

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
        } else if (profileResult.reason?.response?.status === 404) {
          setProfile(null);
        } else {
          throw profileResult.reason;
        }

        if (completionResult.status === 'fulfilled') {
          setCompletion(completionResult.value);
        }

        if (skillsResult.status === 'fulfilled') {
          setAvailableSkills(skillsResult.value);
        }
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError?.response?.data?.message || 'Unable to load your profile. Please try again.'
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const skillNames = useMemo(() => {
    const selectedIds = new Set(
      (profile?.skills || []).map((skillId) =>
        typeof skillId === 'string' ? skillId : skillId?._id
      )
    );

    return availableSkills
      .filter((skill) => selectedIds.has(skill._id))
      .map((skill) => skill.skillName);
  }, [availableSkills, profile?.skills]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-semibold text-blue-700">
                {profile?.profileImage?.imageUrl ? (
                  <img
                    src={profile.profileImage.imageUrl}
                    alt={user?.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user?.name || 'U').charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {user?.name || 'Job Seeker'}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      {profile?.currentPosition || 'Current position not added'}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {profile?.location || 'Location not added'}
                    </p>

                    {user?.email && <p className="mt-1 text-sm text-slate-500">{user.email}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit profile
                  </button>
                </div>

                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-slate-900">About</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {profile?.careerSummary ||
                      'Add a career summary to tell employers more about yourself.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Education</h2>
            </div>

            <div className="mt-4 space-y-4">
              {profile?.education?.length ? (
                profile.education.map((entry) => (
                  <article key={entry._id} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="text-sm font-semibold text-slate-900">{entry.qualification}</h3>
                    <p className="mt-1 text-sm text-slate-600">{entry.institutionName}</p>
                    {entry.fieldOfStudy && (
                      <p className="mt-1 text-xs text-slate-500">{entry.fieldOfStudy}</p>
                    )}
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">No education details added yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Skills</h2>

              <button
                type="button"
                onClick={() => navigate('/profile/skills')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {skillNames.length ? (
                skillNames.map((skillName) => (
                  <span
                    key={skillName}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No Skills selected yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Experience</h2>

            <div className="mt-4 space-y-4">
              {profile?.experience?.length ? (
                profile.experience.map((entry) => (
                  <article key={entry._id} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="text-sm font-semibold text-slate-900">{entry.rolePosition}</h3>
                    <p className="mt-1 text-sm text-slate-600">{entry.organization}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">No experience details added yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <ProfileCompletionCard
            completion={completion}
            onViewDetails={() => navigate('/profile/completion')}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Documents & links</h2>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/profile/cv')}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {profile?.cv?.publicId ? 'Manage CV' : 'Upload CV'}
              </button>

              {profile?.portfolioLinks?.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-200 px-4 py-3 text-sm text-blue-600 hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
