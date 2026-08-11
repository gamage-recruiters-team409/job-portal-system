// server/src/controllers/application.controller.js

import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { ApiError } from '../utils/apiError.js';

export async function applyToJob(req, res, next) {
  try {
    const { jobId, coverLetter, resume } = req.body;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new ApiError(400, 'A valid jobId is required.');
    }

    if (!resume?.fileName || !resume?.fileUrl) {
      throw new ApiError(400, 'resume (fileName, fileUrl) is required.');
    }

    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user._id,
      coverLetter,
      resume,
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