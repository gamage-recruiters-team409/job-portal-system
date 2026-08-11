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
 */
export async function getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId }).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments({ user: userId }),
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
 */
export async function notifyApplicationSubmitted({ jobSeekerId, jobSeekerEmail, jobId, jobTitle }) {
  const { notification } = await createNotification({
    user: jobSeekerId,
    type: 'application_submitted',
    message: `Your application for "${jobTitle}" has been submitted.`,
    relatedJob: jobId,
  });

  await sendApplicationSubmittedEmail(jobSeekerEmail, jobTitle);

  return { notification };
}

/**
 * Fires when an employer receives a new application for their job.
 * Creates the in-app notification and sends the alert email.
 * Called by the Application module once the application is saved.
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

  await sendNewApplicationEmail(employerEmail, jobTitle, applicantName);

  return { notification };
}

/**
 * Fires when an application's status changes (e.g. shortlisted, rejected).
 * Creates the in-app notification and sends the status-change email.
 * Called by the Applicant Management module (Kalana) when status is updated.
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

  await sendApplicationStatusChangeEmail(jobSeekerEmail, jobTitle, newStatus);

  return { notification };
}
