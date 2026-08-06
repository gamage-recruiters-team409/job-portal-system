import { sendSuccess } from '../utils/apiResponse.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  createNotification,
} from '../services/notification.service.js';

/**
 * GET /notifications — return the current user's notifications.
 */
export async function listNotifications(req, res, next) {
  try {
    const { notifications } = await getUserNotifications(req.user._id);
    return sendSuccess(res, {
      message: 'Notifications retrieved.',
      data: { notifications },
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

/**
 * POST /notifications — create a notification (internal/testing use).
 */
export async function create(req, res, next) {
  try {
    const { type, message, relatedJob } = req.body;
    const { notification } = await createNotification({
      user: req.user._id,
      type,
      message,
      relatedJob,
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Notification created.',
      data: { notification },
    });
  } catch (error) {
    return next(error);
  }
}