import { rateLimit } from 'express-rate-limit';

/**
 * Route-specific rate limiting for the password-reset endpoints.
 *
 * forgot-password: stricter — prevents email flooding / address probing.
 * reset-password:   caps automated token attempts.
 *
 * Limits are per-IP (default). They should be tuned for the deployed load; the
 * defaults here are a safe starting point and are documented in the PR.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many password reset requests. Please try again later.',
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many attempts. Please try again later.',
});
