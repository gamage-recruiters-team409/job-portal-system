import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid ID format.');

export const skillIdSchema = z.object({
  id: objectId,
});

export const createSkillSchema = z.object({
  skillName: z.string({ error: 'Skill name is required' }).trim().min(1, 'Skill name is required.'),
  categoryId: objectId.optional().nullable(),
});

export const updateSkillSchema = z
  .object({
    skillName: z.string().trim().min(1, 'Skill name is required.').optional(),
    categoryId: objectId.optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty.',
  });

export const getSkillsQuerySchema = z.object({
  categoryId: objectId.optional(),
});
