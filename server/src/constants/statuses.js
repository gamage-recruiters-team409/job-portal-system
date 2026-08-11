export const USER_ROLES = Object.freeze({
  JOB_SEEKER: 'job_seeker',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
});

export const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
});

export const EMPLOYER_VERIFICATION_STATUSES = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

export const JOB_STATUSES = Object.freeze({
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
});

export const APPLICATION_STATUSES = Object.freeze({
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

export const REPORT_STATUSES = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
});

export const NOTIFICATION_STATUSES = Object.freeze({
  READ: 'Read',
  UNREAD: 'Unread',
});

export const REPORT_REASONS = Object.freeze([
  'Fake or non-existent job',
  'Requests payment or personal financial info',
  'Misleading job details',
  'Discriminatory requirements',
  'Spam or duplicate posting',
  'Other',
]);
