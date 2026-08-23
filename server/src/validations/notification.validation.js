import { z } from 'zod';

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId.');

export const notificationIdParamSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

// Matches the real notification.type values created by notification.service.js:
// application_submitted, new_application, application_status_changed
const NOTIFICATION_TYPE_VALUES = [
  'application_submitted',
  'new_application',
  'application_status_changed',
];

export const listNotificationsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    type: z.enum(NOTIFICATION_TYPE_VALUES).optional(),
    unreadOnly: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((val) => val === 'true'),
  })
  .strict();
