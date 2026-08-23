// server/src/controllers/application.controller.js

import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';
import cloudinary from '../config/cloudinary.js';
import { generateJobSeekerCvDownloadUrl } from '../services/jobSeekerProfileMedia.service.js';
import {
  notifyApplicationSubmitted,
  notifyNewApplication,
} from '../services/notification.service.js';

const JOB_SAFE_FIELDS =
  'title location jobType workMode experienceYears salaryCurrency salaryMin salaryMax deadline status companyId category skills';

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

// Fires both notification helpers after a successful Application save.
// Both helpers are already best-effort for email (they never throw on
// email failure — see notification.service.js). This wrapper additionally
// ensures that even an unexpected failure in the notification/DB layer
// itself cannot affect the already-successful Application response —
// the Application was already persisted and its 201 response must not be
// turned into an error by a downstream notification problem.
async function notifyApplicationParties({ application, job, jobSeeker }) {
  try {
    const employer = await User.findById(job.createdBy).select('email');

    await Promise.all([
      notifyApplicationSubmitted({
        jobSeekerId: jobSeeker._id,
        jobSeekerEmail: jobSeeker.email,
        jobId: job._id,
        jobTitle: job.title,
      }),
      employer
        ? notifyNewApplication({
            employerId: job.createdBy,
            employerEmail: employer.email,
            jobId: job._id,
            jobTitle: job.title,
            applicantName: jobSeeker.name,
          })
        : Promise.resolve(),
    ]);
  } catch (error) {
    // Notification failures must never affect the Application response —
    // the Application is already persisted at this point. Log and move on;
    // do not retry here, since retrying could create duplicate notifications.
    console.error(
      `Failed to send application notifications for application ${application._id}:`,
      error.message
    );
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
      await deleteApplicationCvSnapshot(resumeSnapshot.publicId);
      throw dbError;
    }

    // The Application is now successfully persisted. Notifications are
    // fired without awaiting failure-sensitivity — see
    // notifyApplicationParties() for why this can never turn a successful
    // Application into a failed API response.
    await notifyApplicationParties({ application, job, jobSeeker: req.user });

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
      .populate({
  path: 'job',
  select: JOB_SAFE_FIELDS,
  populate: { path: 'companyId', select: 'companyName companyLogo companyLocation' },
})
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
    }).populate({
  path: 'job',
  select: JOB_SAFE_FIELDS,
  populate: { path: 'companyId', select: 'companyName companyLogo companyLocation' },
});

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
