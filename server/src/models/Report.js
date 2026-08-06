import mongoose from 'mongoose';

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
      enum: [
        'pending',
        'under_review',
        'resolved',
        'dismissed',
      ],
      default: 'pending',
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


const Report = model('Report', reportSchema);

export default Report;