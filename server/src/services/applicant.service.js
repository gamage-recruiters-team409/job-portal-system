import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { ApiError } from '../utils/apiError.js';
import { APPLICATION_STATUSES, USER_ROLES } from '../constants/statuses.js';
import { generateJobSeekerCvDownloadUrl } from './jobSeekerProfileMedia.service.js';
import { notifyApplicationStatusChange } from '../services/notification.service.js';

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
 * Calculates total years of experience by summing the date ranges in experience entries.
 * Handles ongoing roles (isCurrentRole or missing endDate) using the current date.
 */
function calculateTotalExperienceYears(experience = []) {
  if (!Array.isArray(experience) || experience.length === 0) return 0;
  const totalMs = experience.reduce((acc, exp) => {
    if (!exp.startDate) return acc;
    const start = new Date(exp.startDate).getTime();
    const end = exp.isCurrentRole || !exp.endDate ? Date.now() : new Date(exp.endDate).getTime();
    const diff = end - start;
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);
  return Number(years.toFixed(1));
}

/**
 * Strips the stored CV fileUrl from a resume snapshot before it goes into a
 * general applicant response. fileName/fileSize are harmless metadata and
 * stay; fileUrl must never be exposed directly, since there is no approved
 * protected CV-access flow yet (per TL review on this PR — CV View &
 * Download remains a documented "Backend Item Remaining" until a dedicated,
 * ownership-checked, short-lived signed-URL endpoint is implemented).
 *
 * Explicitly allow-lists the fields to keep, rather than destructuring
 * fileUrl into a discarded variable, so there is no unused binding for
 * the project's ESLint no-unused-vars rule to flag.
 */
function sanitizeApplicationForResponse(applicationDoc) {
  const obj =
    typeof applicationDoc.toObject === 'function' ? applicationDoc.toObject() : applicationDoc;
  if (obj.resume) {
    obj.resume = {
      fileName: obj.resume.fileName,
      fileSize: obj.resume.fileSize,
    };
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
  const { jobId, status, search, skill, education, minExperience, maxExperience, page, limit } = query;

  // Build the aggregation pipeline
  const pipeline = [];
  const matchStage = {};

  if (jobId) {
    // Ownership check first — throws if not allowed
    await assertJobOwnership(jobId, reqUser);
    matchStage.job = new mongoose.Types.ObjectId(jobId);
  } else {
    // No jobId provided: scoped to employer's jobs only
    if (reqUser.role === USER_ROLES.ADMIN) {
      throw new ApiError(400, 'jobId is required for admin requests.');
    }

    const employerJobs = await Job.find({ createdBy: reqUser._id, isDeleted: false }).select('_id');
    const jobIds = employerJobs.map((j) => j._id);
    matchStage.job = { $in: jobIds };
  }

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

  // Join with Jobs to get title for display across multiple jobs
  pipeline.push({
    $lookup: {
      from: 'jobs',
      localField: 'job',
      foreignField: '_id',
      as: 'jobData',
      pipeline: [{ $project: { title: 1 } }],
    },
  });
  pipeline.push({ $unwind: '$jobData' });

  // Join with JobSeekerProfiles for skills, education, and experience filters
  pipeline.push({
    $lookup: {
      from: 'jobseekerprofiles',
      localField: 'jobSeeker',
      foreignField: 'user',
      as: 'profileData',
    },
  });
  pipeline.push({
    $unwind: {
      path: '$profileData',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Filter by Skill ObjectId
  if (skill) {
    pipeline.push({
      $match: { 'profileData.skills': new mongoose.Types.ObjectId(skill) },
    });
  }

  // Filter by Education qualification (case-insensitive exact match)
  if (education) {
    pipeline.push({
      $match: {
        'profileData.education.qualification': {
          $regex: `^${escapeRegExp(education)}$`,
          $options: 'i',
        },
      },
    });
  }

  // Compute totalExperienceYears using exact aggregation
  pipeline.push({
    $addFields: {
      totalExperienceYears: {
        $round: [
          {
            $divide: [
              {
                $reduce: {
                  input: { $ifNull: ['$profileData.experience', []] },
                  initialValue: 0,
                  in: {
                    $add: [
                      '$$value',
                      {
                        $cond: [
                          { $not: ['$$this.startDate'] },
                          0,
                          {
                            $let: {
                              vars: {
                                endVal: {
                                  $cond: [
                                    {
                                      $or: [
                                        { $eq: ['$$this.isCurrentRole', true] },
                                        { $not: ['$$this.endDate'] },
                                      ],
                                    },
                                    '$$NOW',
                                    '$$this.endDate',
                                  ],
                                },
                              },
                              in: {
                                $let: {
                                  vars: {
                                    diffMs: { $subtract: ['$$endVal', '$$this.startDate'] },
                                  },
                                  in: { $cond: [{ $gt: ['$$diffMs', 0] }, '$$diffMs', 0] },
                                },
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              1000 * 60 * 60 * 24 * 365.25,
            ],
          },
          1,
        ],
      },
    },
  });

  // Filter totalExperienceYears by minExperience / maxExperience if provided
  if (minExperience !== undefined || maxExperience !== undefined) {
    const expMatch = {};
    if (minExperience !== undefined) expMatch.$gte = minExperience;
    if (maxExperience !== undefined) expMatch.$lt = maxExperience;
    pipeline.push({ $match: { totalExperienceYears: expMatch } });
  }

  // Stage 3: optional search — case-insensitive regex on name or email.
  if (search) {
    const escapedSearch = escapeRegExp(search);
    const regex = { $regex: escapedSearch, $options: 'i' };
    pipeline.push({
      $match: { $or: [{ 'jobSeekerData.name': regex }, { 'jobSeekerData.email': regex }] },
    });
  }

  // Stage 4: shape the output — expose fields needed by controller.
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
      totalExperienceYears: 1,
      jobSeeker: {
        _id: '$jobSeekerData._id',
        name: '$jobSeekerData.name',
        email: '$jobSeekerData.email',
      },
      job: {
        _id: '$jobData._id',
        title: '$jobData.title',
      },
    },
  });

  // Stage 5: sort newest first so pagination is stable and predictable
  pipeline.push({ $sort: { createdAt: -1 } });

  // Stages 6+: count total then paginate (facet keeps it to one round-trip)
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
 * Returns a single Application with jobSeeker (name, email) and job populated,
 * plus the applicant's JobSeekerProfile details (or null if not created).
 * Ownership check is against the populated job's createdBy field.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ application: import('mongoose').Document, jobSeekerProfile: object | null }>}
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

  // Query JobSeekerProfile read-only by applicant's user _id & resolve Skill IDs to names
  const profile = await JobSeekerProfile.findOne({ user: application.jobSeeker._id }).populate({
    path: 'skills',
    select: 'skillName',
  });

  let jobSeekerProfile = null;
  if (profile) {
    jobSeekerProfile = {
      location: profile.location || null,
      careerSummary: profile.careerSummary || null,
      currentPosition: profile.currentPosition || null,
      totalExperienceYears: calculateTotalExperienceYears(profile.experience),
      education: (profile.education || []).map((edu) => ({
        institutionName: edu.institutionName,
        qualification: edu.qualification,
        fieldOfStudy: edu.fieldOfStudy || null,
        startDate: edu.startDate,
        endDate: edu.endDate || null,
      })),
      experience: (profile.experience || []).map((exp) => ({
        organization: exp.organization,
        rolePosition: exp.rolePosition,
        startDate: exp.startDate,
        endDate: exp.endDate || null,
        isCurrentRole: Boolean(exp.isCurrentRole),
      })),
      skills: (profile.skills || []).map((skill) => ({
        _id: skill._id,
        name: skill.skillName || skill.name || '',
      })),
    };
  }

  return {
    application: sanitizeApplicationForResponse(application),
    jobSeekerProfile,
  };
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

  const application = await Application.findById(applicationId)
    .populate('job', 'createdBy isDeleted title')
    .populate('jobSeeker', 'email');
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

  try {
    await notifyApplicationStatusChange({
      jobSeekerId: application.jobSeeker._id,
      jobSeekerEmail: application.jobSeeker.email,
      jobId: application.job._id,
      jobTitle: application.job.title,
      newStatus: status,
      note: note,
    });
  } catch (error) {
    console.error(
      `Failed to send status-change notification for application ${application._id}:`,
      error.message
    );
  }

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

// ---------------------------------------------------------------------------
// 6. Get applicant CV download URL
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/applicants/:id/cv
 *
 * Generates a short-lived signed Cloudinary download URL for an applicant's CV.
 * Checks job ownership before generating the URL.
 *
 * @param {string} applicationId - the :id route param
 * @param {object} reqUser       - req.user from protect middleware
 * @returns {Promise<{ downloadUrl: string, expiresAt: number, fileName?: string }>}
 */
export async function getApplicantCv(applicationId, reqUser) {
  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw new ApiError(404, 'Application not found.');
  }

  await assertJobOwnership(application.job._id.toString(), reqUser);

  if (application.status === APPLICATION_STATUSES.WITHDRAWN) {
    throw new ApiError(403, 'CV access is not available for a withdrawn application.');
  }

  if (!application.resume?.publicId) {
    throw new ApiError(404, 'No CV available for this applicant.');
  }

  const { downloadUrl, expiresAt } = generateJobSeekerCvDownloadUrl(application.resume.publicId);

  return {
    downloadUrl,
    expiresAt,
    fileName: application.resume.fileName,
  };
}

// ---------------------------------------------------------------------------
// 7. Get applicant filter options
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/applicants/filter-options
 *
 * Scopes to the employer's own jobs (or all jobs if admin) and extracts distinct
 * qualification values from applicants' profiles.
 *
 * @param {object} reqUser - req.user from protect middleware
 * @returns {Promise<{ educationOptions: string[] }>}
 */
export async function getApplicantFilterOptions(reqUser) {
  const matchStage = {};

  if (reqUser.role !== USER_ROLES.ADMIN) {
    const employerJobs = await Job.find({ createdBy: reqUser._id, isDeleted: false }).select('_id');
    const jobIds = employerJobs.map((j) => j._id);
    matchStage.job = { $in: jobIds };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'jobseekerprofiles',
        localField: 'jobSeeker',
        foreignField: 'user',
        as: 'profileData',
      },
    },
    { $unwind: '$profileData' },
    { $unwind: '$profileData.education' },
    {
      $match: {
        'profileData.education.qualification': {
          $exists: true,
          $type: 'string',
          $ne: '',
        },
      },
    },
    {
      $group: {
        _id: '$profileData.education.qualification',
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 50 },
  ];

  const results = await Application.aggregate(pipeline);
  const educationOptions = results.map((r) => r._id).filter(Boolean);

  return { educationOptions };
}