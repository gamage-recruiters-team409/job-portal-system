// server/src/validations/application.validation.js

import { z } from 'zod';

// Correction #2: strict hexadecimal ObjectId validator, no spaces.
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

// Single source of truth for the application :id param, so the route
// file does not need to duplicate this schema.
export const applicationIdParamSchema = z.object({
  id: objectId,
});
