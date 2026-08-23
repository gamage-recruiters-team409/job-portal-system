import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';
import ProfileImageManager from '../components/ProfileImageManager.jsx';
import { getMyProfile, updateMyProfile } from '../services/jobSeekerProfileService.js';

const INITIAL_FORM = {
  currentPosition: '',
  location: '',
  careerSummary: '',
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');
  const [mediaFeedback, setMediaFeedback] = useState(null);

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

        setProfileImageUrl(profile?.profileImage?.imageUrl || '');
      } catch (requestError) {
        if (requestError?.response?.status !== 404 && active) {
          setError(requestError?.response?.data?.message || 'Unable to load your profile.');
        }
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
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Heading */}
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h1 className="text-xl font-bold text-slate-900">Edit profile</h1>
          </div>

          <div className="p-6 sm:p-8">
            {/* Profile image success / delete feedback */}
            {mediaFeedback && (
              <div
                className={`mb-6 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
                  mediaFeedback.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
                role="status"
              >
                <p>{mediaFeedback.message}</p>

                <button
                  type="button"
                  onClick={() => setMediaFeedback(null)}
                  aria-label="Dismiss profile image message"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
                    mediaFeedback.type === 'success'
                      ? 'text-green-600 hover:bg-green-100 hover:text-green-800'
                      : 'text-red-600 hover:bg-red-100 hover:text-red-800'
                  }`}
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* General profile error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Account information + profile image */}
            <div className="grid items-start gap-8 border-b border-slate-100 pb-7 sm:grid-cols-[minmax(0,430px)_150px] sm:justify-between">
              {/* Name and Email */}
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500"
                  />
                </div>
              </div>

              {/* Profile image
                  Mobile: shown before Name and Email
                  Tablet/Desktop: shown in the right column */}
              <div className="order-first flex justify-center sm:order-none sm:justify-center">
                <ProfileImageManager
                  currentImageUrl={profileImageUrl}
                  userName={user?.name}
                  onImageChange={setProfileImageUrl}
                  onFeedback={setMediaFeedback}
                />
              </div>
            </div>

            {/* Current Position + Location */}
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
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
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  placeholder="e.g. Colombo 07"
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Career Summary */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="careerSummary" className="text-sm font-medium text-slate-700">
                  Career summary
                </label>

                <span className="text-xs text-slate-400">{form.careerSummary.length}/2000</span>
              </div>

              <textarea
                id="careerSummary"
                name="careerSummary"
                rows={7}
                maxLength={2000}
                value={form.careerSummary}
                onChange={handleChange}
                placeholder="Tell employers about your experience, strengths and career interests..."
                className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
