import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getActiveSkills,
  getMyProfile,
  updateMySkills,
} from '../services/jobSeekerProfileService.js';

const MAX_PROFILE_SKILLS = 50;
const MAX_SEARCH_LENGTH = 50;

export default function SkillsPage() {
  const navigate = useNavigate();

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialDataReady, setIsInitialDataReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      setIsLoading(true);
      setIsInitialDataReady(false);
      setError('');

      try {
        const [skills, profileResult] = await Promise.all([
          getActiveSkills(),
          getMyProfile()
            .then((profile) => ({
              profile,
              profileMissing: false,
            }))
            .catch((requestError) => {
              if (requestError?.response?.status === 404) {
                return {
                  profile: null,
                  profileMissing: true,
                };
              }

              throw requestError;
            }),
        ]);

        if (!active) return;

        const activeSkills = Array.isArray(skills) ? skills : [];

        const activeSkillIds = new Set(
          activeSkills
            .map((skill) => skill?._id)
            .filter(Boolean)
            .map((skillId) => String(skillId))
        );

        const existingSkillIds = (profileResult.profile?.skills || [])
          .map((skill) => (typeof skill === 'string' ? skill : skill?._id))
          .filter(Boolean)
          .map((skillId) => String(skillId))
          .filter((skillId) => activeSkillIds.has(skillId));

        setAvailableSkills(activeSkills);
        setSelectedSkillIds(existingSkillIds);
        setIsInitialDataReady(true);
      } catch (requestError) {
        if (!active) return;

        setAvailableSkills([]);
        setSelectedSkillIds([]);
        setIsInitialDataReady(false);

        setError(
          requestError?.response?.data?.message ||
            'Unable to load Skills. Please retry before making changes.'
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
  }, [reloadKey]);

  function normalizeSearchValue(value) {
    return value.replace(/\s+/g, ' ').trim().toLowerCase();
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
    setSearchTerm(event.target.value.slice(0, MAX_SEARCH_LENGTH));
  }

  function handleRetry() {
    setReloadKey((current) => current + 1);
  }

  function handleSkillToggle(skillId) {
    if (!isInitialDataReady) return;

    setError('');

    setSelectedSkillIds((current) => {
      const normalizedSkillId = String(skillId);
      const isAlreadySelected = current.includes(normalizedSkillId);

      if (isAlreadySelected) {
        return current.filter((id) => id !== normalizedSkillId);
      }

      if (current.length >= MAX_PROFILE_SKILLS) {
        setError(`You can select up to ${MAX_PROFILE_SKILLS} Skills.`);

        return current;
      }

      return [...current, normalizedSkillId];
    });
  }

  async function handleSave() {
    if (!isInitialDataReady || isLoading || isSaving) {
      return;
    }

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
              <div
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <p>{error}</p>

                {!isInitialDataReady && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {isInitialDataReady && (
              <>
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
                        const skillId = String(skill._id);
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
                              <p className="text-sm font-medium text-slate-800">
                                {skill.skillName}
                              </p>
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
              </>
            )}
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
              disabled={!isInitialDataReady || isLoading || isSaving}
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
