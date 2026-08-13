import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getActiveSkills,
  getMyProfile,
  updateMySkills,
} from '../services/jobSeekerProfileService.js';

const MAX_PROFILE_SKILLS = 50;
const MAX_SEARCH_LENGTH = 50;

function getSkillId(skill) {
  if (typeof skill === 'string') {
    return skill;
  }

  return skill?._id ? String(skill._id) : '';
}

export default function SkillsPage() {
  const navigate = useNavigate();

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        setIsLoading(true);
        setError('');

        /*
         * Load the active shared Skill catalogue and the Job Seeker Profile
         * independently.
         *
         * A new Job Seeker may not have a Profile yet, so GET /me can return
         * 404. That is a valid empty-selection state because PATCH /me/skills
         * can create/upsert the Profile when the first Skills are saved.
         */
        const [skillsResult, profileResult] = await Promise.allSettled([
          getActiveSkills(),
          getMyProfile(),
        ]);

        if (!active) return;

        if (skillsResult.status === 'rejected') {
          throw skillsResult.reason;
        }

        const skills = skillsResult.value || [];
        setAvailableSkills(skills);

        let existingSkillIds = [];

        if (profileResult.status === 'fulfilled') {
          existingSkillIds = (profileResult.value?.skills || []).map(getSkillId).filter(Boolean);
        } else if (profileResult.reason?.response?.status !== 404) {
          throw profileResult.reason;
        }

        /*
         * The shared Skills API returns active Skills only.
         * Normalize existing Profile Skill references against the active
         * catalogue so stale/deactivated Skill IDs are never submitted.
         */
        const activeSkillIds = new Set(skills.map((skill) => getSkillId(skill)).filter(Boolean));

        const normalizedSelectedSkillIds = [
          ...new Set(existingSkillIds.filter((skillId) => activeSkillIds.has(String(skillId)))),
        ];

        setSelectedSkillIds(normalizedSelectedSkillIds);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError?.response?.data?.message || 'Unable to load Skills. Please try again.'
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      active = false;
    };
  }, []);

  function normalizeSearchValue(value) {
    return value
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  const filteredSkills = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchTerm);

    if (!normalizedSearch) {
      return availableSkills;
    }

    return availableSkills.filter((skill) => {
      const normalizedSkillName = normalizeSearchValue(skill.skillName || '');

      return normalizedSkillName.includes(normalizedSearch);
    });
  }, [availableSkills, searchTerm]);

  function handleSearchChange(event) {
    const sanitizedValue = event.target.value
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .slice(0, MAX_SEARCH_LENGTH);

    setSearchTerm(sanitizedValue);
  }

  function handleSkillToggle(skillId) {
    setError('');

    setSelectedSkillIds((current) => {
      const isAlreadySelected = current.includes(skillId);

      if (isAlreadySelected) {
        return current.filter((id) => id !== skillId);
      }

      if (current.length >= MAX_PROFILE_SKILLS) {
        setError(`You can select up to ${MAX_PROFILE_SKILLS} Skills.`);

        return current;
      }

      return [...current, skillId];
    });
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setError('');

      await updateMySkills(selectedSkillIds);

      navigate('/profile');
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to update your Skills. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading Skills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                aria-label="Back to profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg font-bold text-slate-900">Skills</h1>

                <p className="mt-0.5 text-xs text-slate-400">{selectedSkillIds.length} selected</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Search */}
            <div>
              <label
                htmlFor="skill-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search Skills
              </label>

              <input
                id="skill-search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                maxLength={MAX_SEARCH_LENGTH}
                autoComplete="off"
                placeholder="Search available Skills..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Available shared Skills */}
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">Available Skills</h2>

              <div className="mt-3 space-y-3">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => {
                    const skillId = getSkillId(skill);
                    const isSelected = selectedSkillIds.includes(skillId);

                    return (
                      <label
                        key={skillId}
                        className={[
                          'flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 transition-colors',
                          isSelected
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSkillToggle(skillId)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{skill.skillName}</p>
                        </div>

                        {isSelected && (
                          <span className="text-xs font-medium text-blue-600">Selected</span>
                        )}
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
                    <p className="text-sm text-slate-500">No matching Skills found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Skills'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
