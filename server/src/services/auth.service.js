import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { ACCOUNT_STATUSES, USER_ROLES } from '../constants/statuses.js';
import { sendVerificationEmail, sendResetPasswordEmail } from './email.service.js';

const VERIFY_EMAIL_PURPOSE = 'verify-email';
const RESET_PASSWORD_PURPOSE = 'reset-password';

function signVerificationToken(userId) {
  return jwt.sign({ sub: userId, purpose: VERIFY_EMAIL_PURPOSE }, env.jwtSecret, {
    expiresIn: env.emailVerificationExpiresIn,
  });
}

function signResetToken(userId) {
  return jwt.sign({ sub: userId, purpose: RESET_PASSWORD_PURPOSE }, env.jwtSecret, {
    expiresIn: env.resetPasswordExpiresIn,
  });
}

/**
 * Create an account and send a verification email.
 * Registration does NOT issue a session token — the account must be verified
 * (via /auth/verify-email/:token) before it can log in.
 *
 * @param {object} data validated register body (name, email, password, role)
 * @returns {Promise<{ user: import('mongoose').Document }>}
 */
export async function registerUser(data) {
  const { name, email, password, role } = data;

  if (role === USER_ROLES.ADMIN) {
    throw new ApiError(403, 'Admin accounts cannot be created through registration.');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, role });
  const token = signVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);

  return { user };
}

/**
 * Verify credentials and return a session token.
 * Unverified accounts are prevented from signing in until their email is verified.
 */
export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
    throw new ApiError(403, 'This account is not active.');
  }

  if (!user.emailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  const token = user.generateAuthToken();
  return { token, user };
}

/**
 * Confirm a verification token and mark the account verified.
 */
export async function verifyEmail(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(400, 'The verification link is invalid or has expired.');
  }

  if (decoded.purpose !== VERIFY_EMAIL_PURPOSE || !decoded.sub) {
    throw new ApiError(400, 'The verification link is invalid or has expired.');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(400, 'The account for this verification link no longer exists.');
  }

  if (user.emailVerified) {
    return { user };
  }

  user.emailVerified = true;
  await user.save();
  return { user };
}

/**
 * Send a fresh verification email for an existing unverified account.
 */
export async function resendVerification(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No account found with this email address.');
  }

  if (user.emailVerified) {
    throw new ApiError(409, 'This account is already verified.');
  }

  const token = signVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);
  return { user };
}

/**
 * Send a password-reset email with a short-lived signed token.
 *
 * The response is intentionally identical whether or not the account exists
 * (a 200 "if an account exists, an email has been sent") so that this endpoint
 * cannot be used to probe which email addresses are registered.
 */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });

  if (user) {
    const token = signResetToken(user.id);
    await sendResetPasswordEmail(user.email, token);
  }

  return { sent: true };
}

/**
 * Reset the account password using a valid reset token.
 * Throws if the token is invalid/expired or was issued for the wrong purpose.
 */
export async function resetPassword(token, newPassword) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(400, 'The reset link is invalid or has expired.');
  }

  if (decoded.purpose !== RESET_PASSWORD_PURPOSE || !decoded.sub) {
    throw new ApiError(400, 'The reset link is invalid or has expired.');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(400, 'The account for this reset link no longer exists.');
  }

  user.password = newPassword;
  await user.save();
  return { user };
}
