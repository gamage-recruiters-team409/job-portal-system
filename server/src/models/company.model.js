import mongoose from 'mongoose';
import { EMPLOYER_VERIFICATION_STATUSES } from '../constants/statuses.js';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    companySize: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyTelephone: {
      type: String,
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    companyLocation: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(EMPLOYER_VERIFICATION_STATUSES),
      default: EMPLOYER_VERIFICATION_STATUSES.PENDING,
    },
    employerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const Company = mongoose.model('Company', companySchema);

export default Company;
