import { z } from 'zod';

export const portfolioFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Portfolio label is required.')
    .max(100, 'Portfolio label cannot exceed 100 characters.'),

  url: z
    .string()
    .trim()
    .min(1, 'Portfolio URL is required.')
    .url('A valid portfolio URL is required.')
    .regex(/^https?:\/\//i, 'Portfolio URL must use http:// or https://.'),
});
