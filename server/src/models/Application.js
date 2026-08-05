import mongoose from 'mongoose';

const { Schema } = mongoose;

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUS);

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
      ref: 'Job',
      required: true,
      index: true,
    },
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      default: APPLICATION_STATUS.APPLIED,
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    resume: {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileSize: { type: Number },
    },
    emailCopyRequested: {
      type: Boolean,
      default: false,
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
    withdrawnAt: {
      type: Date,
    },
    withdrawReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

applicationSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  } else if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });

    if (this.status === APPLICATION_STATUS.WITHDRAWN) {
      this.withdrawnAt = new Date();
    }
  }
  next();
});

applicationSchema.methods.canBeWithdrawn = function () {
  return [
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.UNDER_REVIEW,
  ].includes(this.status);
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;