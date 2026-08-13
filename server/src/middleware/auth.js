import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { ACCOUNT_STATUSES } from '../constants/statuses.js';

/**
 * Verifies the JWT from the Authorization header and attaches the user to
 * `req.user`. Rejects missing/invalid tokens and suspended accounts.
 */
export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      throw new ApiError(401, 'Not authorized. Please log in.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new ApiError(401, 'Session expired or invalid. Please log in again.');
    }

    // tokenVersion is select:false by default but is needed here to enforce
    // session invalidation after a password change.
    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user) {
      throw new ApiError(401, 'The user for this session no longer exists.');
    }

    if (user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
      throw new ApiError(403, 'This account is not active.');
    }

    if (!user.emailVerified) {
      throw new ApiError(403, 'Please verify your email before continuing.');
    }

    // Reject any session token issued before the user last changed their
    // password (tokenVersion is bumped on password reset).
    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Optional authentication — attaches req.user if a valid token is present,
 * but never blocks the request if the token is missing or invalid.
 * Used on public routes that behave differently for a logged-in user
 * (e.g. skipping view-count increments when the job's own employer views it).
 */
export async function attachUserIfPresent(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return next();
    }

    // tokenVersion is select:false by default but is needed here to correctly
    // identify a user whose password was reset (see protect's comment above).
    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (
      user &&
      user.accountStatus === ACCOUNT_STATUSES.ACTIVE &&
      (decoded.tokenVersion ?? 0) === (user.tokenVersion ?? 0)
    ) {
      req.user = user;
    }

    return next();
  } catch {
    return next();
  }
}

/**
 * Restricts a route to one or more roles. Must run after `protect`.
 * e.g. `requireRole(USER_ROLES.ADMIN)` or `requireRole(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN)`.
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized. Please log in.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };
}
