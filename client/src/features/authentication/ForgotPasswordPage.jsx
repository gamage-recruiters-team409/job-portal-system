import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../../services/authService.js';
import AuthLayout from './components/AuthLayout.jsx';
import FormInput from './components/FormInput.jsx';
import { getErrorMessage } from './utils/getErrorMessage.js';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
});

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState(null);
  const [sent, setSent] = useState(false);
  const [expiresIn, setExpiresIn] = useState('30 minutes');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      const res = await forgotPassword(values.email);
      const exp = res?.data?.expiresInHuman || '30 minutes';
      setExpiresIn(exp);
      setSent(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  // The backend deliberately returns the same response whether or not the
  // account exists, so we always show the generic "check your inbox" message.
  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If an account exists for that address, a reset link is on its way."
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
            The reset link expires in {expiresIn}. If you don't receive it, check your spam folder or
            try again.
          </p>
          <Link
            to="/login"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
