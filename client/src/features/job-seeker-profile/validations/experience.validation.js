import { z } from 'zod';

function isValidDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export const experienceFormSchema = z
  .object({
    organization: z
      .string()
      .trim()
      .min(1, 'Organization is required.')
      .max(150, 'Organization must not exceed 150 characters.'),

    rolePosition: z
      .string()
      .trim()
      .min(1, 'Role / Position is required.')
      .max(150, 'Role / Position must not exceed 150 characters.'),

    startDate: z
      .string()
      .min(1, 'Start date is required.')
      .refine(isValidDate, 'A valid start date is required.'),

    endDate: z.string().optional().default(''),

    isCurrentRole: z.boolean().default(false),

    description: z.string().trim().max(1000, 'Description must not exceed 1000 characters.'),
  })
  .superRefine((data, context) => {
    if (data.isCurrentRole) {
      return;
    }

    if (data.endDate && !isValidDate(data.endDate)) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'A valid end date is required.',
      });

      return;
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date cannot be earlier than start date.',
      });
    }
  });
