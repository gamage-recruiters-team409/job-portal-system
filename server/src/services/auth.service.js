import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { ACCOUNT_STATUSES, USER_ROLES } from '../constants/statuses.js';
import { sendVerificationEmail, sendResetPasswordEmail } from './email.service.js';
import { durationToMs } from '../utils/duration.js';

const VERIFY_EMAIL_PURPOSE = 'verify-email';

function signVerificationToken(userId) {
  return jwt.sign({ sub: userId, purpose: VERIFY_EMAIL_PURPOSE }, env.jwtSecret, {
    expiresIn: env.emailVerificationExpiresIn,
  });
}

/** Generate a cryptographically random one-time reset token. */
function generateResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

/** One-way hash of the reset token, stored on the user instead of the raw value. */
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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
  // password is select:false by default; tokenVersion also needs to be loaded
  // here so the issued auth token embeds the current session version.
  const user = await User.findOne({ email }).select('+password +tokenVersion');
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
 * Send a password-reset email with a one-time, server-side token.
 *
 * The response (status, message, and — as far as is practical — timing) is the
 * same whether or not the account exists, so this endpoint cannot be used to
 * probe registered email addresses. Email delivery failures are logged
 * server-side but never surfaced to the caller, keeping the behaviour uniform.
 */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });

  if (user) {
    // Generate a fresh one-time token and store only its hash. Overwriting the
    // stored hash means any previously issued reset link is invalidated.
    const token = generateResetToken();
    user.resetPasswordTokenHash = hashResetToken(token);
    user.resetPasswordTokenExpires = new Date(
      Date.now() + durationToMs(env.resetPasswordExpiresIn)
    );
    await user.save();

    // Deliver email asynchronously (non-blocking). This keeps the response time
    // of a registered-email request close to that of an unknown email (which
    // returns right after the lookup), so account existence is not revealed by
    // timing. Errors are logged but never surfaced to the caller.
    sendResetPasswordEmail(user.email, token).catch((error) => {
      console.error(`[reset-password] email delivery failed for ${user.email}:`, error);
    });
  }

  return { sent: true };
}

/**
 * Reset the account password using a one-time reset token.
 *
 * The token is single-use: it is matched against the stored hash and then
 * cleared, so it cannot be reused. A token also fails if it has expired or if a
 * newer reset link has since been requested (which overwrote the hash).
 */
export async function resetPassword(token, newPassword) {
  const hash = hashResetToken(token);

  // Atomically claim the token: the query matches only an un-consumed, valid
  // reset token, and the update clears it and bumps tokenVersion in one
  // findOneAndUpdate. Two concurrent requests with the same token race here —
  // only the first finds a matching document; the second matches nothing.
  const user = await User.findOneAndUpdate(
    {
      resetPasswordTokenHash: hash,
      resetPasswordTokenExpires: { $gt: new Date() },
    },
    {
      $unset: { resetPasswordTokenHash: '', resetPasswordTokenExpires: '' },
      $inc: { tokenVersion: 1 },
    },
    { returnDocument: 'after' }
  );

  if (!user) {
    throw new ApiError(400, 'The reset link is invalid or has expired.');
  }

  // Token is now consumed; set the new password (hashed by the pre-save hook).
  user.password = newPassword;
  await user.save();

  return { user };
}
