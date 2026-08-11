import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid ID format.');

export const categoryIdSchema = z.object({
  id: objectId,
});

export const createCategorySchema = z.object({
  categoryName: z
    .string({ error: 'Category name is required' })
    .trim()
    .min(1, 'Category name is required.'),
  description: z.string().trim().optional(),
});

export const updateCategorySchema = z
  .object({
    categoryName: z.string().trim().min(1, 'Category name is required.').optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty.',
  });
