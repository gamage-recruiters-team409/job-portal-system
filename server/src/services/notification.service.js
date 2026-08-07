import Notification from '../models/NotificationModel.js';
import { ApiError } from '../utils/apiError.js';
import { NOTIFICATION_STATUSES } from '../constants/statuses.js';

/**
 * Returns a paginated page of notifications belonging to the given user,
 * newest first. Used by both the Notification Dropdown (small limit) and
 * the Notification Centre (larger limit).
 */
export async function getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId }).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments({ user: userId }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Marks a single notification as read.
 * Only the owning user may mark their own notification as read.
 */
export async function markNotificationAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  notification.status = NOTIFICATION_STATUSES.READ;
  await notification.save();

  return { notification };
}

/**
 * Trusted internal service — NOT exposed via a public route.
 * Called directly by other backend modules (Application, Job, Admin, etc.)
 * when a real notification-worthy event occurs.
 */
export async function createNotification({ user, type, message, relatedJob }) {
  const notification = await Notification.create({
    user,
    type,
    message,
    relatedJob,
  });
  return { notification };
}
