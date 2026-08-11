import User from '../models/User.js';
import Report from '../models/Report.js';
import { ApiError } from '../utils/apiError.js';
import { USER_ROLES, ACCOUNT_STATUSES, REPORT_STATUSES } from '../constants/statuses.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get paginated, searchable, filterable list of users for Admin.
 */
export async function getUsers({ search, status, role, page = 1, limit = 10 }) {
  // Base filter: NEVER return admin users through this API
  const filter = { role: { $ne: USER_ROLES.ADMIN } };

  // Search by name or email (case-insensitive, regex-safe)
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  // Filter by account status
  if (status) {
    filter.accountStatus = status;
  }

  // Filter by role
  if (role) {
    filter.role = role;
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single user by ID for Admin view.
 */
export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  
  if (user.role === USER_ROLES.ADMIN) {
    throw new ApiError(403, 'You cannot manage other admin accounts.');
  }
  
  return user;
}

/**
 * Admin creates a new user (auto-verified, no email verification required).
 */
export async function createUser({ name, email, password, role }) {
  // Check for duplicate email (case-insensitive)
  const existingUser = await User.findOne({
    email: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
  });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const user = new User({
    name,
    email,
    password,
    role,
    accountStatus: ACCOUNT_STATUSES.ACTIVE,
    emailVerified: true, // Admin-created users are auto-verified
  });

  await user.save();
  return user;
}

/**
 * Admin updates basic user fields (name, email, role).
 */
export async function updateUser(userId, { name, email, role }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  
  if (user.role === USER_ROLES.ADMIN) {
    throw new ApiError(403, 'You cannot manage other admin accounts.');
  }

  // If email is being changed, check for duplicates
  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new ApiError(409, 'Another user with this email already exists.');
    }
    user.email = email;
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;

  await user.save();
  return user;
}

/**
 * Admin changes a user's account status (suspend / reactivate / ban).
 * Prevents the admin from changing their own status.
 */
export async function updateUserStatus(userId, newStatus, adminUserId) {
  // Prevent admin from suspending/banning themselves
  if (userId === adminUserId.toString()) {
    throw new ApiError(400, 'You cannot change your own account status.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  
  if (user.role === USER_ROLES.ADMIN) {
    throw new ApiError(403, 'You cannot manage other admin accounts.');
  }

  if (user.accountStatus === newStatus) {
    throw new ApiError(400, `User is already ${newStatus}.`);
  }

  user.accountStatus = newStatus;
  await user.save();
  return user;
}

/**
 * Get user statistics for Admin dashboard cards.
 */
export async function getUserStats() {
  const [totalRegistered, activeNow, reportsPending] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: ACCOUNT_STATUSES.ACTIVE }),
    Report.countDocuments({ status: REPORT_STATUSES.PENDING }),
  ]);

  return {
    totalRegistered,
    activeNow,
    reportsPending,
  };
}
