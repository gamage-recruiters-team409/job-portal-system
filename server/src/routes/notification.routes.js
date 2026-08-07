import { Router } from 'express';
import { listNotifications, markAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
} from '../validations/notification.validation.js';

const notificationRouter = Router();

notificationRouter.get(
  '/',
  protect,
  validate(listNotificationsQuerySchema, 'query'),
  listNotifications
);
notificationRouter.patch(
  '/:id/read',
  protect,
  validate(notificationIdParamSchema, 'params'),
  markAsRead
);

export default notificationRouter;
