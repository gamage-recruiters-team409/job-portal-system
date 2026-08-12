// server/src/controllers/application.controller.js

import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';
import cloudinary from '../config/cloudinary.js';
import { generateJobSeekerCvDownloadUrl } from '../services/jobSeekerProfileMedia.service.js';

const JOB_SAFE_FIELDS =
  'title location jobType workMode experienceYears salaryCurrency salaryMin salaryMax deadline status companyId category skills';

// Correction (re-review): the Profile CV is stored as an authenticated
// Cloudinary asset, so its stored fileUrl is not a plain fetchable URL.
// We generate a fresh, short-lived signed download URL from the trusted
// publicId (the approved server-side flow) and upload FROM that signed
// URL, rather than depending on the raw protected delivery URL.
async function createApplicationCvSnapshot(profileCv, applicationId) {
  const { downloadUrl } = generateJobSeekerCvDownloadUrl(profileCv.publicId);

  const result = await cloudinary.uploader.upload(downloadUrl, {
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

// Cleanup helper: if Application persistence fails after the Cloudinary
// snapshot was already created, remove the orphaned snapshot asset.
async function deleteApplicationCvSnapshot(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      type: 'authenticated',
      invalidate: true,
    });
  } catch {
    // Best-effort cleanup — do not let cleanup failure mask the original error.
  }
}

export async function applyToJob(req, res, next) {
  let resumeSnapshot;

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

    const applicationId = new Application()._id;

    resumeSnapshot = await createApplicationCvSnapshot(profile.cv, applicationId);

    let application;
    try {
      application = await Application.create({
        _id: applicationId,
        job: jobId,
        jobSeeker: req.user._id,
        coverLetter,
        resume: resumeSnapshot,
      });
    } catch (dbError) {
      // Roll back the Cloudinary snapshot since the Application was
      // never persisted (e.g. duplicate application or a DB failure).
      await deleteApplicationCvSnapshot(resumeSnapshot.publicId);
      throw dbError;
    }

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
