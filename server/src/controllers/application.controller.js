// server/src/controllers/application.controller.js

import cloudinary from '../config/cloudinary.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';

// Correction #3: only these Job fields are safe to expose to a Job
// Seeker viewing their own Application — excludes internal moderation
// fields (reviewNote, reviewedBy, reviewedAt, statusHistory, isDeleted,
// deletedAt, createdBy, viewsCount).
const JOB_SAFE_FIELDS =
  'title location jobType workMode experienceYears salaryCurrency salaryMin salaryMax deadline status companyId category skills';

// Correction #1: applying duplicates the current profile CV into a
// dedicated, durable "application snapshot" folder in Cloudinary. This
// keeps the Application's resume valid even if the Job Seeker later
// replaces or deletes their profile CV (which deletes the original
// Cloudinary asset). The snapshot is a private/authenticated asset,
// downloadable only via the approved signed Employer/Admin flow.
async function createApplicationCvSnapshot(profileCv, applicationId) {
  const result = await cloudinary.uploader.upload(profileCv.fileUrl, {
    resource_type: 'raw',
    type: 'authenticated',
    folder: 'applications/cv_snapshots',
    public_id: `${applicationId}`,
    overwrite: false,
  });

  return {
    fileName: profileCv.fileName,
    publicId: result.public_id,
  };
}

export async function applyToJob(req, res, next) {
  try {
    const { jobId, coverLetter } = req.validatedBody;

    const job = await Job.findOne({ _id: jobId, isDeleted: false });

    if (!job) {
      throw new ApiError(404, 'Job not found.');
    }

    if (job.status !== JOB_STATUSES.PUBLISHED) {
      throw new ApiError(400, 'This job is not open for applications.');
    }

    if (job.deadline && job.deadline < new Date()) {
      throw new ApiError(400, 'The application deadline for this job has passed.');
    }

    const profile = await JobSeekerProfile.findOne({ user: req.user._id });

    if (!profile?.cv?.fileUrl || !profile?.cv?.publicId) {
      throw new ApiError(400, 'Please upload a CV to your profile before applying for a job.');
    }

    // Reserve the Application _id up front so it can be used as the
    // stable Cloudinary public_id for the CV snapshot.
    const applicationId = new Application()._id;

    const resumeSnapshot = await createApplicationCvSnapshot(profile.cv, applicationId);

    const application = await Application.create({
      _id: applicationId,
      job: jobId,
      jobSeeker: req.user._id,
      coverLetter,
      resume: resumeSnapshot,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, 'You have already applied to this job.'));
    }
    return next(error);
  }
}

export async function getApplicationHistory(req, res, next) {
  try {
    const applications = await Application.find({ jobSeeker: req.user._id })
      .populate('job', JOB_SAFE_FIELDS)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Application history retrieved successfully.',
      data: applications,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getApplicationDetails(req, res, next) {
  try {
    const { id } = req.validatedParams;

    const application = await Application.findOne({
      _id: id,
      jobSeeker: req.user._id,
    }).populate('job', JOB_SAFE_FIELDS);

    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    return res.status(200).json({
      success: true,
      message: 'Application details retrieved successfully.',
      data: application,
    });
  } catch (error) {
    return next(error);
  }
}
