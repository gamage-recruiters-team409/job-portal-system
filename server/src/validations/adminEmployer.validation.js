import { z } from 'zod';
import { EMPLOYER_VERIFICATION_STATUSES } from '../constants/statuses.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid company ID format.');

export const companyIdParamSchema = z.object({
  companyId: objectId,
});

export const getEmployersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .enum(Object.values(EMPLOYER_VERIFICATION_STATUSES), {
      message: `Status must be one of: ${Object.values(EMPLOYER_VERIFICATION_STATUSES).join(', ')}`,
    })
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const verifyEmployerSchema = z.object({
  status: z.enum(
    [EMPLOYER_VERIFICATION_STATUSES.VERIFIED, EMPLOYER_VERIFICATION_STATUSES.REJECTED],
    {
      message: `Status must be either '${EMPLOYER_VERIFICATION_STATUSES.VERIFIED}' or '${EMPLOYER_VERIFICATION_STATUSES.REJECTED}'.`,
    }
  ),
});
