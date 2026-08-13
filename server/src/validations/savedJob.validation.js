// server/src/validations/savedJob.validation.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'Invalid ID format.');

export const saveJobSchema = z.object({
  jobId: objectId,
});

export const savedJobIdParamSchema = z.object({
  jobId: objectId,
});
