import { sendSuccess } from '../utils/apiResponse.js';
import { getUserNotifications, markNotificationAsRead } from '../services/notification.service.js';

/**
 * GET /notifications — return the current user's notifications, paginated.
 */
export async function listNotifications(req, res, next) {
  try {
    const { page, limit } = req.validatedQuery;
    const { notifications, pagination } = await getUserNotifications(req.user._id, {
      page,
      limit,
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
    const { notification } = await markNotificationAsRead(req.params.id, req.user._id);
    return sendSuccess(res, {
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    return next(error);
  }
}
