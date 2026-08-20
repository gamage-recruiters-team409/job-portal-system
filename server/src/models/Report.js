import mongoose from 'mongoose';
import { REPORT_STATUSES } from '../constants/statuses.js';

const { Schema, model } = mongoose;

const reportSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },

    companyName: {
      type: String,
      trim: true,
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      default: REPORT_STATUSES.PENDING,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewedAt: {
      type: Date,
    },

    reviewNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


// Prevent duplicate active reports for the same job by the same user
reportSchema.index(
  { jobId: 1, reportedBy: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          REPORT_STATUSES.PENDING,
          REPORT_STATUSES.UNDER_REVIEW,
        ],
      },
    },
  }
);


const Report = model('Report', reportSchema);

export default Report;