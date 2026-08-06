import Notification from '../models/NotificationModel.js';
import { ApiError } from '../utils/apiError.js';
import { NOTIFICATION_STATUSES } from '../constants/statuses.js';

/**
 * Returns all notifications belonging to the given user, newest first.
 */
export async function getUserNotifications(userId) {
  const notifications = await Notification.find({ user: userId }).sort('-createdAt');
  return { notifications };
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

export async function createNotification({ user, type, message, relatedJob }) {
  const notification = await Notification.create({
    user,
    type,
    message,
    relatedJob,
  });
  return { notification };
}