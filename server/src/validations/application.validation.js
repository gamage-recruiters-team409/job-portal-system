// server/src/validations/application.validation.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid ID format.');

export const applyToJobSchema = z.object({
  jobId: objectId,
  coverLetter: z
    .string()
    .trim()
    .max(3000, 'Cover letter cannot exceed 3000 characters.')
    .optional(),
});
