import { sendSuccess } from '../utils/apiResponse.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../services/notification.service.js';

/**
 * GET /notifications — return the current user's notifications, paginated,
 * with optional type/unreadOnly filtering applied before pagination.
 */
export async function listNotifications(req, res, next) {
  try {
    const { page, limit, type, unreadOnly } = req.validatedQuery;
    const { notifications, pagination } = await getUserNotifications(req.user._id, {
      page,
      limit,
      type,
      unreadOnly,
    });
    return sendSuccess(res, {
      message: 'Notifications retrieved.',
      data: { notifications, pagination },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /notifications/:id/read — mark one notification as read.
 */
export async function markAsRead(req, res, next) {
  try {
    const { notification } = await markNotificationAsRead(req.validatedParams.id, req.user._id);
    return sendSuccess(res, {
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /notifications/mark-all-read — mark ALL of the user's unread
 * notifications as read, across all pages.
 */
export async function markAllAsRead(req, res, next) {
  try {
    const { modifiedCount } = await markAllNotificationsAsRead(req.user._id);
    return sendSuccess(res, {
      message: 'All notifications marked as read.',
      data: { modifiedCount },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /notifications/unread-count — return the total unread count across
 * all pages, used for the notification bell badge.
 */
export async function unreadCount(req, res, next) {
  try {
    const { count } = await getUnreadNotificationCount(req.user._id);
    return sendSuccess(res, {
      message: 'Unread notification count retrieved.',
      data: { count },
    });
  } catch (error) {
    return next(error);
  }
}
