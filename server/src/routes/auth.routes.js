import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmailController,
  resendVerificationController,
} from '../controllers/auth.controller.js';
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
} from '../validations/auth.validation.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/verify-email/:token', verifyEmailController);
authRouter.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  resendVerificationController
);
authRouter.get('/me', protect, getMe);

export default authRouter;
