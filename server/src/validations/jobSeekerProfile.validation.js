import { z } from 'zod';

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId.');

const educationBaseSchema = z
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

    fieldOfStudy: z
      .string()
      .trim()
      .max(150, 'Field of study cannot exceed 150 characters.')
      .optional(),

    startDate: z.coerce.date({
      error: 'A valid start date is required.',
    }),

    endDate: z.coerce
      .date({
        error: 'End date must be valid.',
      })
      .nullable()
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters.')
      .optional(),
  })
  .strict();

const experienceBaseSchema = z
  .object({
    organization: z
      .string()
      .trim()
      .min(1, 'Organization is required.')
      .max(150, 'Organization cannot exceed 150 characters.'),

    rolePosition: z
      .string()
      .trim()
      .min(1, 'Role or position is required.')
      .max(150, 'Role or position cannot exceed 150 characters.'),

    startDate: z.coerce.date({
      error: 'A valid start date is required.',
    }),

    endDate: z.coerce
      .date({
        error: 'End date must be valid.',
      })
      .nullable()
      .optional(),

    isCurrentRole: z.boolean().optional(),

    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters.')
      .optional(),
  })
  .strict();

const validateDateRange = (data, context) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End date cannot be earlier than start date.',
    });
  }
};

const validateCurrentRole = (data, context) => {
  if (data.isCurrentRole === true && data.endDate != null) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'A current role cannot contain an end date.',
    });
  }
};

const validateExperienceRecord = (data, context) => {
  validateDateRange(data, context);
  validateCurrentRole(data, context);
};

const skillsArraySchema = z
  .array(objectIdSchema)
  .max(50, 'A profile cannot contain more than 50 skills.')
  .superRefine((skills, context) => {
    const existingSkillIds = new Set();

    skills.forEach((skillId, index) => {
      const normalizedSkillId = skillId.toLowerCase();

      if (existingSkillIds.has(normalizedSkillId)) {
        context.addIssue({
          code: 'custom',
          path: [index],
          message: 'Duplicate skills are not allowed.',
        });
      }

      existingSkillIds.add(normalizedSkillId);
    });
  });

export const educationRecordSchema = educationBaseSchema.superRefine(validateDateRange);

export const experienceRecordSchema = experienceBaseSchema.superRefine(validateExperienceRecord);

export const updateJobSeekerProfileSchema = z
  .object({
    currentPosition: z
      .string()
      .trim()
      .max(150, 'Current position cannot exceed 150 characters.')
      .optional(),

    careerSummary: z
      .string()
      .trim()
      .max(2000, 'Career summary cannot exceed 2000 characters.')
      .optional(),

    location: z.string().trim().max(150, 'Location cannot exceed 150 characters.').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one profile field must be provided.',
  });

export const updateProfileSkillsSchema = z
  .object({
    skills: skillsArraySchema,
  })
  .strict();

export const createEducationSchema = educationRecordSchema;

export const updateEducationSchema = educationBaseSchema
  .partial()
  .superRefine(validateDateRange)
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one education field must be provided.',
  });

export const createExperienceSchema = experienceRecordSchema;

export const updateExperienceSchema = experienceBaseSchema
  .partial()
  .superRefine(validateExperienceRecord)
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one experience field must be provided.',
  });

export const createPortfolioLinkSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, 'Portfolio label is required.')
      .max(100, 'Portfolio label cannot exceed 100 characters.'),

    url: z
      .string()
      .trim()
      .min(1, 'Portfolio URL is required.')
      .url('A valid portfolio URL is required.'),
  })
  .strict();

export const updatePortfolioLinkSchema = createPortfolioLinkSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one portfolio field must be provided.',
  });

export const profileEntryIdSchema = z
  .object({
    entryId: objectIdSchema,
  })
  .strict();
