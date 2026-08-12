import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';
import { getMyProfile, updateMyProfile } from '../services/jobSeekerProfileService.js';

const INITIAL_FORM = {
  currentPosition: '',
  location: '',
  careerSummary: '',
};

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profile = await getMyProfile();

        if (!active) return;

        setForm({
          currentPosition: profile?.currentPosition || '',
          location: profile?.location || '',
          careerSummary: profile?.careerSummary || '',
        });
      } catch (requestError) {
        if (requestError?.response?.status !== 404 && active) {
          setError(requestError?.response?.data?.message || 'Unable to load your profile.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      await updateMyProfile(form);
      navigate('/profile');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save your profile changes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h1 className="text-xl font-bold text-slate-900">Edit profile</h1>

          <p className="mt-1 text-sm text-slate-500">
            Update your professional profile information.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-400">
                Account information is managed separately.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="currentPosition"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Current position
              </label>
              <input
                id="currentPosition"
                name="currentPosition"
                type="text"
                maxLength={150}
                value={form.currentPosition}
                onChange={handleChange}
                placeholder="e.g. Software Engineering Undergraduate"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                maxLength={150}
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Colombo, Sri Lanka"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="careerSummary"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Career summary
            </label>
            <textarea
              id="careerSummary"
              name="careerSummary"
              rows={6}
              maxLength={2000}
              value={form.careerSummary}
              onChange={handleChange}
              placeholder="Tell employers about your experience, strengths and career interests..."
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {form.careerSummary.length}/2000
            </p>
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
