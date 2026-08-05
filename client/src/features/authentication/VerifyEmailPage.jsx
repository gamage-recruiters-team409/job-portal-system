import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../services/authService.js';
import AuthLayout from './components/AuthLayout.jsx';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  INVALID: 'invalid',
  EXPIRED: 'expired',
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(STATUS.LOADING);

  useEffect(() => {
    if (!token) {
      setStatus(STATUS.INVALID);
      return;
    }

    verifyEmail(token)
      .then(() => setStatus(STATUS.SUCCESS))
      .catch((error) => {
        const message = error?.response?.data?.message ?? '';
        // Backend returns 400 for invalid/already-used tokens
        // and 410 for expired tokens — map both to a user-friendly state.
        if (
          error?.response?.status === 410 ||
          message.toLowerCase().includes('expired')
        ) {
          setStatus(STATUS.EXPIRED);
        } else {
          setStatus(STATUS.INVALID);
        }
      });
  }, [token]);

  if (status === STATUS.LOADING) {
    return (
      <AuthLayout title="Verifying your email…" subtitle="Please wait a moment.">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Confirming your email address…</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === STATUS.SUCCESS) {
    return (
      <AuthLayout
        title="Email verified!"
        subtitle="Your account is now active. You can sign in."
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mt-6 text-slate-600">
            Your email address has been confirmed. Your account is ready to use.
          </p>
          <Link
            to="/login"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === STATUS.EXPIRED) {
    return (
      <AuthLayout
        title="Link expired"
        subtitle="Verification links are only valid for 24 hours."
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-6 text-slate-600">
            This verification link has expired. Sign in to your account and we will send you a
            new one.
          </p>
          <Link
            to="/login"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // STATUS.INVALID — missing token, already used, or any unexpected error
  return (
    <AuthLayout
      title="Invalid verification link"
      subtitle="This link is not recognised or has already been used."
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="mt-6 text-slate-600">
          The link you followed is invalid or has already been used. If your account is not yet
          active, please sign in to request a new verification email.
        </p>
        <Link
          to="/login"
          className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Go to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
