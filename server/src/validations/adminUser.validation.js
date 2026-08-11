import { z } from 'zod';
import { USER_ROLES, ACCOUNT_STATUSES } from '../constants/statuses.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid user ID format.');

export const userIdParamSchema = z.object({
  userId: objectId,
});

export const getUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .enum(Object.values(ACCOUNT_STATUSES), {
      message: `Status must be one of: ${Object.values(ACCOUNT_STATUSES).join(', ')}`,
    })
    .optional(),
  role: z
    .enum(Object.values(USER_ROLES), {
      message: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
    })
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name cannot exceed 100 characters.'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address.'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters.'),
  role: z.enum(Object.values(USER_ROLES), {
    message: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
  }),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty.')
      .max(100, 'Name cannot exceed 100 characters.')
      .optional(),
    email: z.string().trim().email('Please provide a valid email address.').optional(),
    role: z
      .enum(Object.values(USER_ROLES), {
        message: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty.',
  });

export const updateUserStatusSchema = z.object({
  status: z.enum(Object.values(ACCOUNT_STATUSES), {
    message: `Status must be one of: ${Object.values(ACCOUNT_STATUSES).join(', ')}`,
  }),
});
