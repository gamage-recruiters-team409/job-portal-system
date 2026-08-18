import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  unreadCount,
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

notificationRouter.patch(
  '/:id/read',
  protect,
  validate(notificationIdParamSchema, 'params'),
  markAsRead
);

export default notificationRouter;
