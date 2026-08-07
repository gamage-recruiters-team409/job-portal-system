import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmailController,
  resendVerificationController,
  forgotPassword,
  resetPasswordController,
} from '../controllers/auth.controller.js';
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { forgotPasswordLimiter, resetPasswordLimiter } from '../middleware/rateLimit.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/verify-email/:token', verifyEmailController);
authRouter.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  resendVerificationController
);
authRouter.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), resetPasswordController);
authRouter.get('/me', protect, getMe);

export default authRouter;
