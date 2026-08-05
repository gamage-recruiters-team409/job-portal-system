import mongoose from 'mongoose';
import { JOB_STATUSES } from '../constants/statuses.js';
import { JOB_TYPES, WORK_MODES } from '../constants/jobOptions.js';

const { Schema, model } = mongoose;

const JOB_STATUS_VALUES = Object.values(JOB_STATUSES);

const statusHistoryEntrySchema = new Schema(
  {
    status: {
      type: String,
      enum: JOB_STATUS_VALUES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],

    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      required: true,
    },
    workMode: {
      type: String,
      enum: Object.values(WORK_MODES),
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    salaryCurrency: {
      type: String,
      default: 'LKR',
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          if (value == null || this.salaryMin == null) return true;
          return value >= this.salaryMin;
        },
        message: 'salaryMax cannot be lower than salaryMin.',
      },
    },

    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          if (!this.isNew) return true; // only enforce on creation, not on every edit
          return value > new Date();
        },
        message: 'Deadline must be a future date.',
      },
    },

    status: {
      type: String,
      enum: JOB_STATUS_VALUES,
      default: JOB_STATUSES.DRAFT,
      required: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Admin review fields — set only by Sahan's approve/reject/suspend actions
    reviewNote: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },

    // Soft delete — job is hidden from all interfaces but kept for history
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },

    statusHistory: [statusHistoryEntrySchema],

    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Helpful indexes for public search/filter/listing
jobSchema.index({ status: 1, isDeleted: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ deadline: 1 });

const Job = model('Job', jobSchema);

export default Job;
