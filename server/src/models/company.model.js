import mongoose from 'mongoose';

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
