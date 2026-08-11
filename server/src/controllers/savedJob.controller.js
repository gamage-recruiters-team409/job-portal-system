// server/src/controllers/savedJob.controller.js

import mongoose from 'mongoose';
import SavedJob from '../models/SavedJob.js';
import { ApiError } from '../utils/apiError.js';

export async function saveJob(req, res, next) {
  try {
    const { jobId } = req.body;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new ApiError(400, 'A valid jobId is required.');
    }

    const savedJob = await SavedJob.create({
      job: jobId,
      jobSeeker: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully.',
      data: savedJob,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, 'You have already saved this job.'));
    }
    return next(error);
  }
}

export async function removeSavedJob(req, res, next) {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new ApiError(400, 'A valid jobId is required.');
    }

    const deleted = await SavedJob.findOneAndDelete({
      job: jobId,
      jobSeeker: req.user._id,
    });

    if (!deleted) {
      throw new ApiError(404, 'Saved job not found.');
    }

    return res.status(200).json({
      success: true,
      message: 'Saved job removed successfully.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSavedJobs(req, res, next) {
  try {
    const savedJobs = await SavedJob.find({ jobSeeker: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Saved jobs retrieved successfully.',
      data: savedJobs,
    });
  } catch (error) {
    return next(error);
  }
}