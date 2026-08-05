// server/src/models/Application.js

import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../constants/statuses.js';

const { Schema } = mongoose;

const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUSES);

// Records each status change so the frontend Status Timeline can be
// rendered directly from stored data.
//
// IMPORTANT: status updates must go through a service function that
// calls document.save() (not findOneAndUpdate/updateOne), so this
// pre-save hook always fires and statusHistory stays accurate.
// Confirmed with Kalana on 06 Aug 2026 — Applicant Management APIs
// (Shortlist/Reject actions) will follow this pattern.
const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const applicationSchema = new Schema(
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
    status: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      default: APPLICATION_STATUSES.APPLIED,
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    // Snapshot of the CV at the time of application (confirmed with
    // Hiba on 06 Aug 2026) — intentionally NOT a reference to
    // JobSeekerProfile, so the Application still shows the original
    // CV even if the job seeker later replaces their profile CV.
    resume: {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileSize: { type: Number },
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    employerNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Duplicate-application prevention: one job seeker cannot apply to
// the same job twice.
applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

// Auto-tracks statusHistory on creation and on any status change.
// Only fires when .save() is used (see note above statusHistorySchema).
applicationSchema.pre('save', function () {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  } else if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;