// server/src/models/SavedJob.js

import mongoose from 'mongoose';

const { Schema } = mongoose;

const savedJobSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job', // Job model owned by Disura
      required: true,
      index: true,
    },
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: 'User', // User model owned by Bimsara
      required: true,
      index: true,
    },
  },
  { timestamps: true } // createdAt used for "Saved X days ago"
);

// Prevent saving the same job twice by the same job seeker
savedJobSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;