import { z } from 'zod';

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

export const educationFormSchema = z
  .object({
    institutionName: z
      .string()
      .trim()
      .min(1, 'Institution name is required.')
      .max(150, 'Institution name cannot exceed 150 characters.'),

    qualification: z
      .string()
      .trim()
      .min(1, 'Qualification is required.')
      .max(150, 'Qualification cannot exceed 150 characters.'),

    fieldOfStudy: z.string().trim().max(150, 'Field of study cannot exceed 150 characters.'),

    startDate: z
      .string()
      .min(1, 'Start date is required.')
      .refine(isValidDate, 'A valid start date is required.'),

    endDate: z.string(),

    description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters.'),
  })
  .superRefine((data, context) => {
    if (data.endDate && !isValidDate(data.endDate)) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be valid.',
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
