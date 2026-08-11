import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';
import { APPLICATION_STATUSES, USER_ROLES } from '../constants/statuses.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Escapes special regex characters in user-provided query strings, so
 * `search` is always treated as literal text rather than a regex pattern.
 * Matches the existing pattern used in job.service.js (keywordFilter) for
 * consistency across the codebase 
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips the stored CV fileUrl from a resume snapshot before it goes into a
 * general applicant response. fileName/fileSize are harmless metadata and
 * stay; fileUrl must never be exposed directly, since there is no approved
 * protected CV-access flow yet (per TL review on this PR — CV View &
 * Download remains a documented "Backend Item Remaining" until a dedicated,
 * ownership-checked, short-lived signed-URL endpoint is implemented).
 */
function sanitizeApplicationForResponse(applicationDoc) {
  const obj = typeof applicationDoc.toObject === 'function' ? applicationDoc.toObject() : applicationDoc;
  if (obj.resume) {
    const { fileUrl, ...safeResume } = obj.resume;
    obj.resume = safeResume;
  }
  return obj;
}

/**
 * Load the job and verify that the requesting user owns it (or is an admin).
 * Called at the top of every service function that touches applicant data.
 *
 * Rules (Rule 7):
 *  - EMPLOYER  → must be job.createdBy
 *  - ADMIN     → always allowed
 *
 * @param {string} jobId   - ObjectId string of the job to check
 * @param {object} reqUser - req.user set by the `protect` middleware
 * @returns {Promise<import('mongoose').Document>} the Job document
 * @throws {ApiError} 404 if job not found; 403 if requester does not own it
 */
async function assertJobOwnership(jobId, reqUser) {
  const job = await Job.findById(jobId);
  if (!job || job.isDeleted) {
    throw new ApiError(404, 'Job not found.');
  }

  if (reqUser.role === USER_ROLES.ADMIN) {
    return job; // admins bypass ownership check
  }

  if (job.createdBy.toString() !== reqUser._id.toString()) {
    throw new ApiError(403, 'You do not have permission to access applicants for this job.');
  }

  return job;
}

// ---------------------------------------------------------------------------
// 1. List applicants for a job
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/applicants?jobId=&status=&search=&page=&limit=
 *
 * Returns a paginated list of applications for a job.
 * - Ownership check is performed on the job before querying applications.
 * - `search` matches against the populated jobSeeker's `name` or `email`.
 *   Because Mongoose populate happens after the DB query, we use an aggregation
 *   pipeline that $lookups the User, filters in-DB, then applies pagination —
 *   this avoids loading all documents into memory just to filter by name/email.
 *
 * @param {object} query   - validated query params (jobId, status, search, page, limit)
 * @param {object} reqUser - req.user from protect middleware
 * @returns {Promise<{ applications, pagination }>}
 */
export async function listApplicants(query, reqUser) {
  const { jobId, status, search, page, limit } = query;

  // Ownership check first — throws if not allowed
  await assertJobOwnership(jobId, reqUser);

  // Build the aggregation pipeline
  const pipeline = [];

  // Stage 1: filter by job (uses the index on Application.job)
  const matchStage = { job: new mongoose.Types.ObjectId(jobId) };
  if (status) {
    matchStage.status = status;
  }
  pipeline.push({ $match: matchStage });

  // Stage 2: join with Users to get name + email for search/display
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'jobSeeker',
      foreignField: '_id',
      as: 'jobSeekerData',
      pipeline: [{ $project: { name: 1, email: 1 } }],
    },
  });
  pipeline.push({ $unwind: '$jobSeekerData' });

  // Stage 3: optional search — case-insensitive regex on name or email.
  // Input is escaped so it is always treated as literal text, never as a
  // regex pattern (prevents expensive/unintended regex from user input).
  if (search) {
    const escapedSearch = escapeRegExp(search);
    const regex = { $regex: escapedSearch, $options: 'i' };
    pipeline.push({
      $match: { $or: [{ 'jobSeekerData.name': regex }, { 'jobSeekerData.email': regex }] },
    });
  }

  // Stage 4: shape the output — expose only the fields the controller needs.
  // resume.fileUrl is intentionally excluded — see sanitizeApplicationForResponse
  // note above. No approved CV-access flow exists yet, so the stored CV URL
  // must never appear in the general applicant list.
  pipeline.push({
    $project: {
      _id: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      coverLetter: 1,
      'resume.fileName': 1,
      'resume.fileSize': 1,
      employerNote: 1,
      jobSeeker: {
        _id: '$jobSeekerData._id',
        name: '$jobSeekerData.name',
        email: '$jobSeekerData.email',
      },
    },
  });

  // Stages 5+: count total then paginate (facet keeps it to one round-trip)
  pipeline.push({
    $facet: {
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      totalCount: [{ $count: 'count' }],
    },
  });

  const [result] = await Application.aggregate(pipeline);

  const total = result.totalCount[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    applications: result.data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Get full application details
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/applicants/:id
 *
 * Returns a single Application with jobSeeker (name, email) and job populated.
 * Ownership check is against the populated job's createdBy field.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ application: import('mongoose').Document }>}
 */
export async function getApplicantById(applicationId, reqUser) {
  const application = await Application.findById(applicationId)
    .populate('jobSeeker', 'name email')
    .populate('job');

  if (!application) {
    throw new ApiError(404, 'Application not found.');
  }

  // job is now a populated Job document; pass its _id to assertJobOwnership
  await assertJobOwnership(application.job._id.toString(), reqUser);

  return { application: sanitizeApplicationForResponse(application) };
}

// ---------------------------------------------------------------------------
// 3. Update application status (generic)
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/applicants/:id/status
 *
 * Sets the application status to any of the four employer-settable values.
 * Uses findById + save() so the pre-save hook in Application.js records the
 * change in statusHistory automatically.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} body          - validated body { status, note? }
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ application: import('mongoose').Document }>}
 */
export async function updateApplicantStatus(applicationId, body, reqUser) {
  const { status, note } = body;

  const application = await Application.findById(applicationId).populate('job', 'createdBy isDeleted');
  if (!application) {
    throw new ApiError(404, 'Application not found.');
  }

  await assertJobOwnership(application.job._id.toString(), reqUser);

  // Prevent no-op updates (status is already what was requested)
  if (application.status === status) {
    throw new ApiError(409, `Application is already in '${status}' status.`);
  }

  // Prevent re-opening a withdrawn application — that is the job seeker's
  // domain, not the employer's.
  if (application.status === APPLICATION_STATUSES.WITHDRAWN) {
    throw new ApiError(409, 'Cannot change the status of a withdrawn application.');
  }

  application.status = status;
  if (note !== undefined) {
    application.employerNote = note;
  }

  // .save() triggers the pre-save hook → statusHistory is updated automatically
  await application.save();

  return { application: sanitizeApplicationForResponse(application) };
}

// ---------------------------------------------------------------------------
// 4. Shortlist convenience endpoint
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/applicants/:id/shortlist
 *
 * Convenience wrapper: hardcodes status = SHORTLISTED.
 * Delegates to updateApplicantStatus so ownership check and hook fire once.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} body          - validated body { note? }
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ application: import('mongoose').Document }>}
 */
export async function shortlistApplicant(applicationId, body, reqUser) {
  return updateApplicantStatus(
    applicationId,
    { status: APPLICATION_STATUSES.SHORTLISTED, note: body.note },
    reqUser
  );
}

// ---------------------------------------------------------------------------
// 5. Reject convenience endpoint
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/applicants/:id/reject
 *
 * Convenience wrapper: hardcodes status = REJECTED.
 * Delegates to updateApplicantStatus so ownership check and hook fire once.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} body          - validated body { note? }
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ application: import('mongoose').Document }>}
 */
export async function rejectApplicant(applicationId, body, reqUser) {
  return updateApplicantStatus(
    applicationId,
    { status: APPLICATION_STATUSES.REJECTED, note: body.note },
    reqUser
  );
}
