import { Router } from 'express';
import { listNotifications, markAsRead, create } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const notificationRouter = Router();

notificationRouter.get('/', protect, listNotifications);
notificationRouter.patch('/:id/read', protect, markAsRead);
notificationRouter.post('/', protect, create);

export default notificationRouter;
