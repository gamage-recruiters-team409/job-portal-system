import { Router } from 'express';

import { createSupportMessage } from '../controllers/support.controller.js';

import { validate } from '../middleware/validate.js';

import { supportValidationSchema } from '../validations/support.validation.js';

import { supportSubmissionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(supportSubmissionLimiter);
router.post('/', validate(supportValidationSchema), createSupportMessage);

export default router;
