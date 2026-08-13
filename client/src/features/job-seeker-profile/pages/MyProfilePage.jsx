import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';
import ProfileCompletionCard from '../components/ProfileCompletionCard.jsx';
import {
  getActiveSkills,
  getMyProfile,
  getMyProfileCompletion,
} from '../services/jobSeekerProfileService.js';

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m2 10 10-5 10 5-10 5Z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5" />
      </svg>
    </div>
  );
}

function SkillIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m12 2 9 5-9 5-9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </svg>
    </div>
  );
}

function ExperienceIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </div>
  );
}

function DocumentIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </svg>
    </div>
  );
}

function LinkIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function formatMonthYear(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getExperienceDateRange(experience) {
  if (!experience) {
    return '';
  }

  const startDate = formatMonthYear(experience.startDate);

  const endDate = experience.isCurrentRole ? 'Present' : formatMonthYear(experience.endDate);

  if (startDate && endDate) {
    return `${startDate} – ${endDate}`;
  }

  return startDate || endDate;
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
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
          setAvailableSkills(skillsResult.value || []);
        }
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError?.response?.data?.message || 'Unable to load your profile. Please try again.'
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const skillNames = useMemo(() => {
    const profileSkills = profile?.skills || [];

    return profileSkills
      .map((profileSkill) => {
        if (typeof profileSkill === 'object' && profileSkill !== null && profileSkill.skillName) {
          return profileSkill.skillName;
        }

        const skillId = typeof profileSkill === 'string' ? profileSkill : profileSkill?._id;

        return availableSkills.find((skill) => skill._id === skillId)?.skillName;
      })
      .filter(Boolean);
  }, [availableSkills, profile?.skills]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const firstEducation = profile?.education?.[0];
  const firstExperience = profile?.experience?.[0];
  const firstExperienceDateRange = getExperienceDateRange(firstExperience);

  const portfolioLinks = profile?.portfolioLinks || [];
  const hasPortfolioLinks = portfolioLinks.length > 0;

  // Profile overview shows a maximum of three Skills.
  // All selected Skills remain available through the Manage page.
  const visibleSkillNames = skillNames.slice(0, 3);
  const remainingSkillCount = Math.max(skillNames.length - 3, 0);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1180px] items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        {/* Main profile column */}
        <div className="min-w-0 space-y-5">
          {/* Profile + About */}
          <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]">
            {/* Identity card */}
            <section className="relative flex min-h-[245px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                aria-label="Edit profile"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <EditIcon />
              </button>

              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-semibold text-blue-700">
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

              <h1 className="mt-4 text-lg font-bold text-slate-900">
                {user?.name || 'Job Seeker'}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                {profile?.currentPosition || 'Current position not added'}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {profile?.location || 'Location not added'}
              </p>
            </section>

            {/* About card */}
            <section className="relative min-h-[245px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                aria-label="Edit about section"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <EditIcon />
              </button>

              <h2 className="text-base font-semibold text-slate-900">About</h2>

              <p className="mt-4 whitespace-pre-line pr-8 text-sm leading-6 text-slate-600">
                {profile?.careerSummary ||
                  'Add a career summary to tell employers about your experience, strengths, skills and career interests.'}
              </p>

              {user?.email && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
                </div>
              )}
            </section>
          </div>

          {/* Education */}
          <SectionCard
            title="Education"
            action={
              <span className="text-xs font-medium text-slate-400">
                {profile?.education?.length || 0} entries
              </span>
            }
          >
            {firstEducation ? (
              <div className="flex items-start gap-4">
                <EducationIcon />

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {firstEducation.qualification}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">{firstEducation.institutionName}</p>

                  {firstEducation.fieldOfStudy && (
                    <p className="mt-1 text-xs text-slate-400">{firstEducation.fieldOfStudy}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <EducationIcon />

                <p className="text-sm text-slate-500">No education details added yet.</p>
              </div>
            )}
          </SectionCard>

          {/* Skills */}
          <SectionCard
            title="Skills"
            action={
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">
                  {skillNames.length} selected
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/profile/skills')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              </div>
            }
          >
            {skillNames.length ? (
              <div className="flex items-start gap-4">
                <SkillIcon />

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
                  {visibleSkillNames.map((skillName) => (
                    <span key={skillName} className="text-sm font-medium text-slate-800">
                      {skillName}
                    </span>
                  ))}

                  {remainingSkillCount > 0 && (
                    <span className="text-sm font-medium text-slate-500">
                      +{remainingSkillCount} more
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <SkillIcon />

                <p className="text-sm text-slate-500">No Skills selected yet.</p>
              </div>
            )}
          </SectionCard>

          {/* Experience */}
          <SectionCard
            title="Experience"
            action={
              <span className="text-xs font-medium text-slate-400">
                {profile?.experience?.length || 0} entries
              </span>
            }
          >
            {firstExperience ? (
              <div className="flex items-start gap-4">
                <ExperienceIcon />

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {firstExperience.rolePosition}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">{firstExperience.organization}</p>

                  {firstExperienceDateRange && (
                    <p className="mt-1 text-xs text-slate-400">{firstExperienceDateRange}</p>
                  )}

                  {firstExperience.description && (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {firstExperience.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ExperienceIcon />

                <p className="text-sm text-slate-500">No experience details added yet.</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right-side column */}
        <aside className="flex h-full flex-col gap-5">
          <ProfileCompletionCard
            completion={completion}
            onViewDetails={() => navigate('/profile/completion')}
          />

          {/* Documents & links stays aligned with the bottom of Experience on desktop */}
          <section className="mt-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Documents & links</h2>
            </div>

            <div className="space-y-3 p-4">
              {/* CV */}
              <button
                type="button"
                disabled
                title="CV management will be available when the CV page is integrated."
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-left opacity-70"
              >
                <DocumentIcon />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {profile?.cv?.publicId ? 'My CV' : 'CV not uploaded'}
                  </p>
                </div>

                <span className="text-slate-300">›</span>
              </button>

              {/* Single Portfolio Links overview item */}
              <button
                type="button"
                disabled={!hasPortfolioLinks}
                aria-expanded={hasPortfolioLinks ? isPortfolioOpen : undefined}
                onClick={() => {
                  if (hasPortfolioLinks) {
                    setIsPortfolioOpen((current) => !current);
                  }
                }}
                title={hasPortfolioLinks ? 'View portfolio links' : 'No portfolio links added'}
                className={[
                  'flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-left transition-colors',
                  hasPortfolioLinks
                    ? 'cursor-pointer hover:bg-slate-50'
                    : 'cursor-not-allowed opacity-70',
                ].join(' ')}
              >
                <LinkIcon />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">Portfolio links</p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {hasPortfolioLinks
                      ? `${portfolioLinks.length} link${
                          portfolioLinks.length === 1 ? '' : 's'
                        } added`
                      : 'No portfolio links added'}
                  </p>
                </div>

                <span
                  className={[
                    'text-slate-300 transition-transform',
                    isPortfolioOpen ? 'rotate-90' : '',
                  ].join(' ')}
                >
                  ›
                </span>
              </button>

              {/* Existing portfolio functionality is preserved here */}
              {hasPortfolioLinks && isPortfolioOpen && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-2">
                  {portfolioLinks.map((link) => (
                    <a
                      key={link._id || link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2.5 text-sm text-slate-600 transition-colors hover:text-blue-600"
                    >
                      <span className="min-w-0 truncate">{link.label || 'Portfolio link'}</span>

                      <span className="shrink-0 text-slate-300">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
