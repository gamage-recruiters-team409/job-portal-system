// server/src/models/Application.js

import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../constants/statuses.js';

const { Schema } = mongoose;

// Only the statuses currently active in this model. WITHDRAWN is
// intentionally excluded until the withdrawal flow is approved by
// the Team Lead — still sourced from the shared constants file so
// the values themselves stay in sync with the rest of the project.
const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUSES).filter(
  (status) => status !== APPLICATION_STATUSES.WITHDRAWN
);

// Records each status change so the frontend Status Timeline can be
// rendered directly from stored data.
//
// IMPORTANT: all future Application status changes must use a
// dedicated service flow that loads the document, updates status,
// and calls save() — e.g.:
//   const application = await Application.findById(id);
//   application.status = newStatus;
//   await application.save();
// Do NOT use findOneAndUpdate()/updateOne() for status changes, since
// that bypasses this pre-save hook and statusHistory will not be
// recorded. Confirmed with Kalana on 06 Aug 2026 — the Applicant
// Management APIs (Shortlist/Reject actions) will follow this
// save()-based contract.
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
// Only fires when .save() is used — see the contract documented above.
applicationSchema.pre('save', function () {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  } else if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
