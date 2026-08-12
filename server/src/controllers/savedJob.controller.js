// server/src/controllers/savedJob.controller.js

import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES } from '../constants/statuses.js';

// Card/List display fields — enough for the Saved Jobs UI without
// exposing internal moderation/ownership fields (mirrors the same
// safe-field set used by the Applications module).
const JOB_SAFE_FIELDS =
  'title location jobType workMode experienceYears salaryCurrency salaryMin salaryMax deadline status companyId category skills';

export async function saveJob(req, res, next) {
  try {
    const { jobId } = req.validatedBody;

    // Verify the Job actually exists, is not soft-deleted, is
    // published, and has not passed its deadline before allowing it
    // to be saved (mirrors the Apply Job eligibility check).
    const job = await Job.findOne({ _id: jobId, isDeleted: false });

    if (!job) {
      throw new ApiError(404, 'Job not found.');
    }

    if (job.status !== JOB_STATUSES.PUBLISHED) {
      throw new ApiError(400, 'This job is no longer available to save.');
    }

    if (job.deadline && job.deadline < new Date()) {
      throw new ApiError(400, 'This job posting has passed its application deadline.');
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
    const { jobId } = req.validatedParams;

    // No eligibility check here — a Job Seeker must always be able to
    // unsave/remove a job, even if it was later closed, deleted, or its
    // deadline has passed. Removing a saved item should never be blocked.
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
      .populate('job', JOB_SAFE_FIELDS)
      .sort({ createdAt: -1 });

    // Shape each entry for the Card/List UI, and flag jobs that are no
    // longer valid (deleted by the employer, deadline passed, or no
    // longer published) so the frontend can automatically disable the
    // card/button and show a clear reason instead of a broken or
    // misleading saved item.
    const data = savedJobs.map((savedJob) => {
      const job = savedJob.job;
      const jobIsGone = !job; // employer deleted/soft-deleted the Job
      const jobExpired = Boolean(job?.deadline && job.deadline < new Date());
      const jobNotPublished = Boolean(job) && job.status !== JOB_STATUSES.PUBLISHED;
      const jobUnavailable = jobIsGone || jobExpired || jobNotPublished;

      let unavailableReason = null;
      if (jobIsGone) {
        unavailableReason = 'This job has been removed by the employer.';
      } else if (jobExpired) {
        unavailableReason = 'The application deadline for this job has passed.';
      } else if (jobNotPublished) {
        unavailableReason = 'This job is no longer accepting applications.';
      }

      return {
        _id: savedJob._id,
        savedAt: savedJob.createdAt,
        job: jobIsGone
          ? null
          : {
              _id: job._id,
              title: job.title,
              location: job.location,
              jobType: job.jobType,
              workMode: job.workMode,
              experienceYears: job.experienceYears,
              salaryCurrency: job.salaryCurrency,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              deadline: job.deadline,
              status: job.status,
              companyId: job.companyId,
              category: job.category,
              skills: job.skills,
            },
        isAvailable: !jobUnavailable,
        unavailableReason,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Saved jobs retrieved successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}
