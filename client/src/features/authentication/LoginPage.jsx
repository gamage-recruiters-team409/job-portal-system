import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from './components/AuthLayout.jsx';
import FormInput from './components/FormInput.jsx';
import { getErrorMessage } from './utils/getErrorMessage.js';
import { roleHome } from './utils/roleHome.js';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      const user = await login(values);
      toast.success('Logged in successfully.');
      navigate(roleHome(user.role));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Gamage Recruiters account.">
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

        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        {/* Forgot-password link returns here once the reset flow (blocked on the
            email-delivery decision) is implemented. */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to Gamage Recruiters?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
