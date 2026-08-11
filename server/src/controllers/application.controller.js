// server/src/controllers/application.controller.js

import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';

export async function applyToJob(req, res, next) {
  try {
    // req.validatedBody is set by the validate() middleware (Zod schema)
    const { jobId, coverLetter } = req.validatedBody;

    // Correction #1: verify the Job actually exists, is published,
    // is not soft-deleted, and has not passed its deadline.
    const job = await Job.findOne({
      _id: jobId,
      isDeleted: false,
    });

    if (!job) {
      throw new ApiError(404, 'Job not found.');
    }

    if (job.status !== JOB_STATUSES.PUBLISHED) {
      throw new ApiError(400, 'This job is not open for applications.');
    }

    if (job.deadline && job.deadline < new Date()) {
      throw new ApiError(400, 'The application deadline for this job has passed.');
    }

    // Correction #2: derive the CV from the Job Seeker's approved profile
    // instead of trusting a client-supplied resume.fileUrl.
    const profile = await JobSeekerProfile.findOne({ user: req.user._id });

    if (!profile?.cv?.fileUrl) {
      throw new ApiError(400, 'Please upload a CV to your profile before applying for a job.');
    }

    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user._id,
      coverLetter,
      resume: {
        fileName: profile.cv.fileName,
        fileUrl: profile.cv.fileUrl,
      },
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
      .populate('job')
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
    }).populate('job');

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
