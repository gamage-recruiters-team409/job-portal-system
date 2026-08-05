import { sendSuccess } from '../utils/apiResponse.js';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
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
