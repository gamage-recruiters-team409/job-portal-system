import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  unreadCount,
  deleteAll,
  removeNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
} from '../validations/notification.validation.js';

const notificationRouter = Router();

notificationRouter.get('/unread-count', protect, unreadCount);

notificationRouter.get(
  '/',
  protect,
  validate(listNotificationsQuerySchema, 'query'),
  listNotifications
);

notificationRouter.patch('/mark-all-read', protect, markAllAsRead);

notificationRouter.delete('/delete-all', protect, deleteAll);

notificationRouter.patch(
  '/:id/read',
  protect,
  validate(notificationIdParamSchema, 'params'),
  markAsRead
);

notificationRouter.delete(
  '/:id',
  protect,
  validate(notificationIdParamSchema, 'params'),
  removeNotification
);

export default notificationRouter;
