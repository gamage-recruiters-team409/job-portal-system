import { z } from 'zod';
import { USER_ROLES } from '../constants/statuses.js';

/**
 * Public registration is limited to job seekers and employers.
 * Admin accounts are created only through a trusted internal flow, never here.
 * The `confirmPassword` field is validated for a match but is not stored.
 */
export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .describe('A valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER]).default(USER_ROLES.JOB_SEEKER),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .describe('A valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .describe('A valid email address'),
});
