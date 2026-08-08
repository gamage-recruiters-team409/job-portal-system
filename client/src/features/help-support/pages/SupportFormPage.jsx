import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '../../../services/apiClient';

const supportSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must contain at least 2 characters.')
    .max(50, 'Full name cannot exceed 50 characters.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(100, 'Email cannot exceed 100 characters.'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must contain at least 3 characters.')
    .max(100, 'Subject cannot exceed 100 characters.'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must contain at least 10 characters.')
    .max(1000, 'Message cannot exceed 1000 characters.'),
  role: z.enum(['job_seeker', 'employer'], {
    errorMap: () => ({
      message: 'Please select your role.',
    }),
  }),
});

function SupportFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      fullName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');

    try {
      setLoading(true);

      await apiClient.post('/support', data);

      setSubmitted(true);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <main className="flex justify-center px-6 py-12">
        <div className="w-full max-w-[600px] flex flex-col gap-6">
          {/* Title */}

          <div className="text-center">
            <h1 className="text-[30px] font-bold mb-2">Submit a support message</h1>

            <div className="w-14 h-[3px] bg-[#2563EB] rounded mx-auto"></div>
          </div>

          {/* Success */}

          {submitted && (
            <div
              className="
              flex items-center gap-4
              bg-[#DCFCE7]
              border border-[#86EFAC]
              rounded-xl
              p-5
              "
            >
              <div
                className="
                w-9 h-9 rounded-full
                bg-[#16A34A]
                text-white
                flex items-center
                justify-center
                font-bold
                "
              >
                ✓
              </div>

              <div className="text-sm text-[#166534]">
                <b className="block text-[#14532D]">Message sent successfully</b>
                Our support team will review your message and respond as soon as possible.
              </div>
            </div>
          )}

          {!submitted && (
            <>
              {/* Error */}

              {error && (
                <div
                  className="
              bg-red-50
              border
              border-red-200
              text-red-600
              text-sm
              rounded-xl
              p-4
              "
                >
                  ⚠ {error}
                </div>
              )}

              {/* Intro */}

              <div
                className="
            flex items-center gap-4
            bg-[#EFF6FF]
            border border-[#BFDBFE]
            rounded-xl
            p-5
            "
              >
                <div
                  className="
              w-9 h-9
              rounded-lg
              bg-[#2563EB]
              text-white
              flex
              items-center
              justify-center
              font-bold
              "
                >
                  i
                </div>

                <p className="text-sm text-[#475569]">
                  Fill in the details below and our support team will review your message and
                  respond as soon as possible.
                </p>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="
    bg-white
    border border-[#E2E8F0]
    rounded-xl
    p-7
    shadow-sm
  "
              >
                {/* Full Name */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Full name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className="
    h-12
    border border-[#E2E8F0]
    rounded-lg
    px-4
    outline-none
    focus:border-[#2563EB]
  "
                  />

                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Email address</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="
    h-12
    border border-[#E2E8F0]
    rounded-lg
    px-4
    outline-none
    focus:border-[#2563EB]
  "
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Subject</label>

                  <input
                    type="text"
                    placeholder="What's this about?"
                    {...register('subject')}
                    className="
    h-12
    border border-[#E2E8F0]
    rounded-lg
    px-4
    outline-none
    focus:border-[#2563EB]
  "
                  />

                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Message</label>

                  <textarea
                    placeholder="Describe your issue or question..."
                    {...register('message')}
                    className="
    h-28
    resize-none
    border border-[#E2E8F0]
    rounded-lg
    p-4
    outline-none
    focus:border-[#2563EB]
  "
                  />

                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Role */}
                <div className="mb-6">
                  <div className="flex gap-6 text-sm text-[#475569] mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="job_seeker"
                        {...register('role')}
                        className="accent-[#2563EB]"
                      />
                      I am a Job Seeker
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="employer"
                        {...register('role')}
                        className="accent-[#2563EB]"
                      />
                      I am an Employer
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-2">{errors.role.message}</p>
                  )}
                </div>

                {/* Submit Button */}

                <button
                  type="submit"

                  disabled={loading}

                  className="
              w-full
              h-12
              rounded-lg
              bg-[#2563EB]
              text-white
              font-semibold
              hover:bg-[#1E40AF]
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
              "
                >
                  {loading ? 'Submitting...' : 'Submit message'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SupportFormPage;
