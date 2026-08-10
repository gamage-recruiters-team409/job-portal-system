import { sendSuccess } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { durationToHuman } from '../utils/duration.js';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';

/**
 * POST /auth/register — create an account and email a verification link.
 * Does not return a session token; the account must be verified to log in.
 */
export async function register(req, res, next) {
  try {
    const { user } = await registerUser(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created. Please verify your email to activate it.',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /auth/login — verify credentials and return a session token.
 * Unverified accounts are rejected here.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    return sendSuccess(res, {
      message: 'Logged in successfully.',
      data: { token, user },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /auth/verify-email/:token — confirm a verification token.
 */
export async function verifyEmailController(req, res, next) {
  try {
    const { user } = await verifyEmail(req.params.token);
    return sendSuccess(res, {
      message: 'Email verified successfully. You can now log in.',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /auth/resend-verification — resend the verification email.
 */
export async function resendVerificationController(req, res, next) {
  try {
    await resendVerification(req.body.email);
    return sendSuccess(res, {
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /auth/me — return the currently authenticated user.
 */
export async function getMe(req, res) {
  return sendSuccess(res, {
    message: 'Current user retrieved.',
    data: { user: req.user },
  });
}

/**
 * POST /auth/forgot-password — email a password-reset link if the account exists.
 * The response (status, message) is the same whether or not the account exists
 * (no user probing), and the reset-link lifetime is derived from env so the
 * frontend can display it without hardcoding a value that might drift.
 */
export async function forgotPassword(req, res, next) {
  try {
    await requestPasswordReset(req.body.email);
    return sendSuccess(res, {
      message: 'If an account exists for this email, a password reset link has been sent.',
      data: {
        expiresIn: env.resetPasswordExpiresIn,
        expiresInHuman: durationToHuman(env.resetPasswordExpiresIn),
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /auth/reset-password — set a new password using a valid reset token.
 */
export async function resetPasswordController(req, res, next) {
  try {
    const { token, password } = req.body;
    const { user } = await resetPassword(token, password);
    return sendSuccess(res, {
      message: 'Your password has been reset. You can now log in.',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}
