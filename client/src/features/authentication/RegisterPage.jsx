import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../constants/statuses.js';
import AuthLayout from './components/AuthLayout.jsx';
import FormInput from './components/FormInput.jsx';
import { getErrorMessage } from './utils/getErrorMessage.js';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: USER_ROLES.JOB_SEEKER },
  });

  const selectedRole = watch('role');

  async function onSubmit(values) {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      setRegisteredEmail(values.email);
      setIsRegistered(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  if (isRegistered) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="We've sent a verification link to your inbox."
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
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
                d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
              />
            </svg>
          </div>
          <p className="mt-6 text-slate-600">
            Please check your email address{' '}
            <strong className="text-slate-900">{registeredEmail}</strong> for a verification link to
            activate your account.
          </p>
          <p className="mt-8 text-sm text-slate-500">
            Didn't receive the email? Check your spam folder or try logging in to resend the
            verification link.
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

  return (
    <AuthLayout title="Create an account" subtitle="Join Gamage Recruiters to find or post jobs.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <FormInput
          label="Full name"
          placeholder="Your full name"
          autoComplete="name"
          registration={register('name')}
          error={errors.name?.message}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        <FormInput
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">I am a…</span>
          <div className="flex gap-3">
            <label
              className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                selectedRole === USER_ROLES.JOB_SEEKER
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                value={USER_ROLES.JOB_SEEKER}
                className="sr-only"
                {...register('role')}
              />
              Job Seeker
            </label>
            <label
              className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                selectedRole === USER_ROLES.EMPLOYER
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                value={USER_ROLES.EMPLOYER}
                className="sr-only"
                {...register('role')}
              />
              Employer
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
