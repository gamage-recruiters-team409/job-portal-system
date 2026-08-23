import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: true,
  }
);

const experienceSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    rolePosition: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isCurrentRole: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: true,
  }
);

const portfolioLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const cvSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const profileImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentPosition: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    careerSummary: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    education: {
      type: [educationSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    portfolioLinks: {
      type: [portfolioLinkSchema],
      default: [],
    },
    cv: {
      type: cvSchema,
      default: () => ({}),
    },
    profileImage: {
      type: profileImageSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const JobSeekerProfile = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);

export default JobSeekerProfile;
