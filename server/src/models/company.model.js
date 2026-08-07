import mongoose from 'mongoose';
import { EMPLOYER_VERIFICATION_STATUSES } from '../constants/statuses.js';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      default: null,
    },
    companyLogoPublicId: {
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
      required: true,
      enum: ['1-10', '11-50', '51-200', '200+'],
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    companyTelephone: {
      type: String,
      required: true,
      trim: true,
    },
    companyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    companyLocation: {
      type: String,
      required: true,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(EMPLOYER_VERIFICATION_STATUSES),
      default: EMPLOYER_VERIFICATION_STATUSES.PENDING,
    },
    // Set the first time verificationStatus transitions to VERIFIED (Admin
    // functionality, not yet built). Once set, it anchors the 15-day
    // re-verification edit lock in company.service.js and is never cleared,
    // even if a later edit resets verificationStatus back to pending.
    verifiedAt: {
      type: Date,
      default: null,
    },
    // Timestamp of the last edit that reset verificationStatus to pending.
    // Used with verifiedAt to enforce the 15-day re-verification edit lock.
    lastReVerificationRequestedAt: {
      type: Date,
      default: null,
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
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;
