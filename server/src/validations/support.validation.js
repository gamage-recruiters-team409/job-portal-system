import { z } from 'zod';

export const supportValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters'),

  email: z.string().trim().toLowerCase().email('Invalid email address'),

  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject must not exceed 100 characters'),

  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must not exceed 1000 characters'),

  role: z.enum(['job_seeker', 'employer']),
});
