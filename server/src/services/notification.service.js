import Notification from '../models/NotificationModel.js';
import { ApiError } from '../utils/apiError.js';
import { NOTIFICATION_STATUSES } from '../constants/statuses.js';
import {
  sendApplicationSubmittedEmail,
  sendNewApplicationEmail,
  sendApplicationStatusChangeEmail,
} from './email.service.js';

/**
 * Returns a paginated page of notifications belonging to the given user,
 * newest first. Used by both the Notification Dropdown (small limit) and
 * the Notification Centre (larger limit).
 *
 * Optional filters (type, unreadOnly) are applied in the database query
 * itself, BEFORE pagination — so pagination totals and "no results" states
 * always reflect the filtered dataset, not the full unfiltered one.
 */
export async function getUserNotifications(
  userId,
  { page = 1, limit = 20, type, unreadOnly = false } = {}
) {
  const skip = (page - 1) * limit;

  const query = { user: userId };
  if (type) {
    query.type = type;
  }
  if (unreadOnly) {
    query.status = NOTIFICATION_STATUSES.UNREAD;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(query),
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
 * Marks ALL of the given user's unread notifications as read, in one
 * database operation — not limited to any single page. This is the
 * global "Mark all as read" action, distinct from marking one notification.
 */
export async function markAllNotificationsAsRead(userId) {
  const result = await Notification.updateMany(
    { user: userId, status: NOTIFICATION_STATUSES.UNREAD },
    { $set: { status: NOTIFICATION_STATUSES.READ } }
  );

  return { modifiedCount: result.modifiedCount };
}

/**
 * Returns the total count of unread notifications for the given user,
 * across ALL pages — used for the notification bell badge.
 */
export async function getUnreadNotificationCount(userId) {
  const count = await Notification.countDocuments({
    user: userId,
    status: NOTIFICATION_STATUSES.UNREAD,
  });
  return { count };
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

/**
 * Fires when a job seeker successfully submits an application.
 * Creates the in-app notification and sends the confirmation email.
 * Called by the Application module once the application is saved.
 *
 * The in-app Notification is the source of truth for this event — it is
 * created first and always returned on success. Email delivery is
 * best-effort: if it fails, the failure is logged and reported via
 * `emailSent: false` rather than thrown, so a calling module never treats
 * an already-persisted Notification as a failed operation (which could
 * otherwise cause retries and duplicate notifications).
 */
export async function notifyApplicationSubmitted({ jobSeekerId, jobSeekerEmail, jobId, jobTitle }) {
  const { notification } = await createNotification({
    user: jobSeekerId,
    type: 'application_submitted',
    message: `Your application for "${jobTitle}" has been submitted.`,
    relatedJob: jobId,
  });

  let emailSent = true;
  try {
    await sendApplicationSubmittedEmail(jobSeekerEmail, jobTitle);
  } catch (error) {
    emailSent = false;
    console.error('Failed to send application-submitted email:', error.message);
  }

  return { notification, emailSent };
}

/**
 * Fires when an employer receives a new application for their job.
 * Creates the in-app notification and sends the alert email.
 * Called by the Application module once the application is saved.
 *
 * Same best-effort email behaviour as notifyApplicationSubmitted — see
 * that function's doc comment for details.
 */
export async function notifyNewApplication({
  employerId,
  employerEmail,
  jobId,
  jobTitle,
  applicantName,
}) {
  const { notification } = await createNotification({
    user: employerId,
    type: 'new_application',
    message: `New application received for "${jobTitle}" from ${applicantName}.`,
    relatedJob: jobId,
  });

  let emailSent = true;
  try {
    await sendNewApplicationEmail(employerEmail, jobTitle, applicantName);
  } catch (error) {
    emailSent = false;
    console.error('Failed to send new-application email:', error.message);
  }

  return { notification, emailSent };
}

/**
 * Fires when an application's status changes (e.g. shortlisted, rejected).
 * Creates the in-app notification and sends the status-change email.
 * Called by the Applicant Management module (Kalana) when status is updated.
 *
 * Same best-effort email behaviour as notifyApplicationSubmitted — see
 * that function's doc comment for details.
 */
export async function notifyApplicationStatusChange({
  jobSeekerId,
  jobSeekerEmail,
  jobId,
  jobTitle,
  newStatus,
}) {
  const { notification } = await createNotification({
    user: jobSeekerId,
    type: 'application_status_changed',
    message: `Your application for "${jobTitle}" is now: ${newStatus}.`,
    relatedJob: jobId,
  });

  let emailSent = true;
  try {
    await sendApplicationStatusChangeEmail(jobSeekerEmail, jobTitle, newStatus);
  } catch (error) {
    emailSent = false;
    console.error('Failed to send application-status-change email:', error.message);
  }

  return { notification, emailSent };
}
