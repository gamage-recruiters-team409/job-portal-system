import Notification from '../models/NotificationModel.js';
import { ApiError } from '../utils/apiError.js';
import { NOTIFICATION_STATUSES } from '../constants/statuses.js';
import {
  sendApplicationSubmittedEmail,
  sendNewApplicationEmail,
  sendApplicationStatusChangeEmail,
} from './email.service.js';
import { emitToUser } from '../realtime/socket.js';

const REPORT_STATUS_LABELS = Object.freeze({
  under_review: 'Under Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
});

function formatReportStatus(status) {
  return REPORT_STATUS_LABELS[status] || status;
}

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
  { page = 1, limit = 20, type, unreadOnly = false, before, beforeId } = {}
) {
  const query = { user: userId };
  if (type) {
    query.type = type;
  }
  if (unreadOnly) {
    query.status = NOTIFICATION_STATUSES.UNREAD;
  }

  if (before && beforeId) {
    // Cursor-based path: "give me notifications after this exact
    // already-loaded boundary in the deterministic newest-first order."
    // The tie-breaker on _id prevents skipping records when several
    // notifications share the same createdAt millisecond.
    query.$or = [{ createdAt: { $lt: before } }, { createdAt: before, _id: { $lt: beforeId } }];

    // Fetch one extra document to learn whether more exist beyond this
    // batch, without a separate (and equally driftable) total count.
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = notifications.length > limit;

    return {
      notifications: notifications.slice(0, limit),
      pagination: { limit, hasMore },
    };
  }

  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
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
 * Deletes a single notification.
 * Only the owning user may delete their own notification.
 */
export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  return { notification };
}

/**
 * Deletes all notifications belonging to the given user.
 */
export async function deleteAllNotifications(userId) {
  const result = await Notification.deleteMany({ user: userId });

  return { deletedCount: result.deletedCount };
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
export async function createNotification({ user, type, message, relatedJob, relatedReport }) {
  const notification = await Notification.create({
    user,
    type,
    message,
    relatedJob,
    relatedReport,
  });

  // Best-effort real-time push — same defensive pattern as email sending
  // below: if this fails (e.g. no active socket, or an unexpected error),
  // the notification is already saved and the calling flow must not fail
  // because of it. `emitToUser` itself never throws, but the try/catch
  // stays here as a safety net regardless of that guarantee.
  try {
    emitToUser(String(user), 'notification:new', { notification });
  } catch (error) {
    console.error('Failed to emit real-time notification:', error.message);
  }

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
  note,
}) {
  const message = note
    ? `Your application for "${jobTitle}" is now: ${newStatus}. Employer note: ${note}`
    : `Your application for "${jobTitle}" is now: ${newStatus}.`;

  const { notification } = await createNotification({
    user: jobSeekerId,
    type: 'application_status_changed',
    message,
    relatedJob: jobId,
  });

  let emailSent = true;
  try {
    await sendApplicationStatusChangeEmail(jobSeekerEmail, jobTitle, newStatus, note);
  } catch (error) {
    emailSent = false;
    console.error('Failed to send application-status-change email:', error.message);
  }

  return { notification, emailSent };
}

/**
 * Fires when an Admin reviews and changes the status of a Job Seeker's
 * reported job (e.g. to 'under_review', 'resolved', or 'dismissed').
 * Creates the in-app notification only — no email, per the QA
 * recommendation's exact scope ("adding in-app notifications").
 *
 * Called by the Admin Report Management module (adminReport.service.js)
 * once a report's status update is saved. The caller treats this as
 * best-effort so a notification failure does not make an already-saved
 * moderation update look like it failed.
 */
export async function notifyReportStatusChange({ jobSeekerId, jobTitle, newStatus, reportId }) {
  const statusLabel = formatReportStatus(newStatus);

  const { notification } = await createNotification({
    user: jobSeekerId,
    type: 'report_status_changed',
    message: `Your report on "${jobTitle}" is now: ${statusLabel}.`,
    relatedReport: reportId,
  });

  return { notification };
}
