import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ACCOUNT_STATUSES, USER_ROLES } from '../constants/statuses.js';

/**
 * POST /auth/register — create a new account and return a session token.
 * Duplicate emails and the reserved admin role are rejected here.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role, company } = req.body;

    if (role === USER_ROLES.ADMIN) {
      throw new ApiError(403, 'Admin accounts cannot be created through registration.');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const user = await User.create({ name, email, password, role, company });
    const token = user.generateAuthToken();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully.',
      data: { token, user },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /auth/login — verify credentials and return a session token.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
      throw new ApiError(403, 'This account is not active.');
    }

    const token = user.generateAuthToken();

    return sendSuccess(res, {
      message: 'Logged in successfully.',
      data: { token, user },
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
