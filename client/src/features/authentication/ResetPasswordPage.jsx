import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../services/authService.js';
import AuthLayout from './components/AuthLayout.jsx';
import FormInput from './components/FormInput.jsx';
import { getErrorMessage } from './utils/getErrorMessage.js';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await resetPassword(token, values.password, values.confirmPassword);
      setSuccess(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been reset successfully."
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
            You can now sign in with your new password.
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

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="No reset token was found in the link."
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
            The link you followed is missing a reset token. Please request a new reset link.
          </p>
          <Link
            to="/forgot-password"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter a new password for your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <FormInput
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Reset password'}
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
