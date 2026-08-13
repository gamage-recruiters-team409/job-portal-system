export const JOB_TYPES = Object.freeze({
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
});

export const WORK_MODES = Object.freeze({
  ON_SITE: 'on-site',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
});

export const JOB_TYPE_LABELS = Object.freeze({
  [JOB_TYPES.FULL_TIME]: 'Full-Time',
  [JOB_TYPES.PART_TIME]: 'Part-Time',
  [JOB_TYPES.CONTRACT]: 'Contract',
  [JOB_TYPES.INTERNSHIP]: 'Internship',
});

export const WORK_MODE_LABELS = Object.freeze({
  [WORK_MODES.ON_SITE]: 'On-site',
  [WORK_MODES.REMOTE]: 'Remote',
  [WORK_MODES.HYBRID]: 'Hybrid',
});

export const SALARY_CURRENCIES = Object.freeze({
  LKR: 'LKR',
  USD: 'USD',
});
