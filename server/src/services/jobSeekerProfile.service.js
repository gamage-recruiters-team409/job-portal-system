import JobSeekerProfile from '../models/JobSeekerProfile.js';
import {
  createPortfolioLinkSchema,
  educationRecordSchema,
  experienceRecordSchema,
} from '../validations/jobSeekerProfile.validation.js';

const editableProfileFields = ['currentPosition', 'careerSummary', 'location'];

const PROFILE_COMPLETION_WEIGHTS = Object.freeze({
  basicProfile: 20,
  skills: 15,
  education: 15,
  experience: 15,
  cv: 15,
  profileImage: 10,
  portfolio: 10,
});

const hasTextValue = (value) => typeof value === 'string' && value.trim().length > 0;

const selectEditableProfileFields = (profileData) =>
  Object.fromEntries(
    Object.entries(profileData).filter(([field]) => editableProfileFields.includes(field))
  );

const convertEntryToPlainObject = (entry) => {
  const entryData =
    typeof entry.toObject === 'function'
      ? entry.toObject({
          virtuals: false,
          versionKey: false,
        })
      : { ...entry };

  delete entryData._id;

  return entryData;
};

export const mergeEducationUpdate = (existingEducation, educationUpdates) => {
  const mergedEducation = {
    ...existingEducation,
    ...educationUpdates,
  };

  return educationRecordSchema.parse(mergedEducation);
};

export const mergeExperienceUpdate = (existingExperience, experienceUpdates) => {
  const mergedExperience = {
    ...existingExperience,
    ...experienceUpdates,
  };

  return experienceRecordSchema.parse(mergedExperience);
};

export const mergePortfolioLinkUpdate = (existingPortfolioLink, portfolioUpdates) => {
  const mergedPortfolioLink = {
    ...existingPortfolioLink,
    ...portfolioUpdates,
  };

  return createPortfolioLinkSchema.parse(mergedPortfolioLink);
};

export const calculateProfileCompletion = (profile) => {
  const sectionStatus = {
    basicProfile:
      hasTextValue(profile?.currentPosition) &&
      hasTextValue(profile?.careerSummary) &&
      hasTextValue(profile?.location),

    skills: Array.isArray(profile?.skills) && profile.skills.length > 0,

    education: Array.isArray(profile?.education) && profile.education.length > 0,

    experience: Array.isArray(profile?.experience) && profile.experience.length > 0,

    cv: Boolean(profile?.cv?.publicId),

    profileImage: Boolean(profile?.profileImage?.publicId),

    portfolio: Array.isArray(profile?.portfolioLinks) && profile.portfolioLinks.length > 0,
  };

  const completedSections = Object.entries(sectionStatus)
    .filter(([, completed]) => completed)
    .map(([section]) => section);

  const missingSections = Object.entries(sectionStatus)
    .filter(([, completed]) => !completed)
    .map(([section]) => section);

  const percentage = completedSections.reduce(
    (total, section) => total + PROFILE_COMPLETION_WEIGHTS[section],
    0
  );

  const sections = Object.fromEntries(
    Object.entries(sectionStatus).map(([section, completed]) => [
      section,
      {
        completed,
        weight: PROFILE_COMPLETION_WEIGHTS[section],
      },
    ])
  );

  return {
    percentage,
    completedSections,
    missingSections,
    sections,
  };
};

export const getJobSeekerProfileByUserId = async (userId) => {
  return JobSeekerProfile.findOne({
    user: userId,
  }).exec();
};

export const updateJobSeekerProfileByUserId = async (userId, profileData) => {
  const profileUpdates = selectEditableProfileFields(profileData);

  return JobSeekerProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: profileUpdates,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).exec();
};

export const updateEducationEntryByUserId = async (userId, entryId, educationUpdates) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const educationEntry = profile.education.id(entryId);

  if (!educationEntry) {
    return null;
  }

  const currentEducation = convertEntryToPlainObject(educationEntry);

  const validatedEducation = mergeEducationUpdate(currentEducation, educationUpdates);

  educationEntry.set(validatedEducation);

  await profile.save();

  return educationEntry;
};

export const updateExperienceEntryByUserId = async (userId, entryId, experienceUpdates) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const experienceEntry = profile.experience.id(entryId);

  if (!experienceEntry) {
    return null;
  }

  const currentExperience = convertEntryToPlainObject(experienceEntry);

  const validatedExperience = mergeExperienceUpdate(currentExperience, experienceUpdates);

  experienceEntry.set(validatedExperience);

  await profile.save();

  return experienceEntry;
};

export const saveProfileImageByUserId = async (userId, profileImage) => {
  return JobSeekerProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        profileImage,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).exec();
};

export const removeProfileImageByUserId = async (userId) => {
  return JobSeekerProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        profileImage: {},
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).exec();
};

export const saveCvByUserId = async (userId, cv) => {
  return JobSeekerProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        cv,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).exec();
};

export const removeCvByUserId = async (userId) => {
  return JobSeekerProfile.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        cv: {},
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).exec();
};

export const addEducationEntryByUserId = async (userId, educationData) => {
  let profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    profile = new JobSeekerProfile({
      user: userId,
    });
  }

  profile.education.push(educationData);

  await profile.save();

  return profile.education[profile.education.length - 1];
};

export const deleteEducationEntryByUserId = async (userId, entryId) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const educationEntry = profile.education.id(entryId);

  if (!educationEntry) {
    return null;
  }

  const removedEducation = educationEntry.toObject({
    virtuals: false,
    versionKey: false,
  });

  profile.education.pull(entryId);

  await profile.save();

  return removedEducation;
};

export const addExperienceEntryByUserId = async (userId, experienceData) => {
  let profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    profile = new JobSeekerProfile({
      user: userId,
    });
  }

  profile.experience.push(experienceData);

  await profile.save();

  return profile.experience[profile.experience.length - 1];
};

export const deleteExperienceEntryByUserId = async (userId, entryId) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const experienceEntry = profile.experience.id(entryId);

  if (!experienceEntry) {
    return null;
  }

  const removedExperience = experienceEntry.toObject({
    virtuals: false,
    versionKey: false,
  });

  profile.experience.pull(entryId);

  await profile.save();

  return removedExperience;
};

export const addPortfolioLinkByUserId = async (userId, portfolioData) => {
  let profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    profile = new JobSeekerProfile({
      user: userId,
    });
  }

  profile.portfolioLinks.push(portfolioData);

  await profile.save();

  return profile.portfolioLinks[profile.portfolioLinks.length - 1];
};

export const updatePortfolioLinkByUserId = async (userId, entryId, portfolioUpdates) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const portfolioLink = profile.portfolioLinks.id(entryId);

  if (!portfolioLink) {
    return null;
  }

  const currentPortfolioLink = convertEntryToPlainObject(portfolioLink);

  const validatedPortfolioLink = mergePortfolioLinkUpdate(currentPortfolioLink, portfolioUpdates);

  portfolioLink.set(validatedPortfolioLink);

  await profile.save();

  return portfolioLink;
};

export const deletePortfolioLinkByUserId = async (userId, entryId) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  }).exec();

  if (!profile) {
    return null;
  }

  const portfolioLink = profile.portfolioLinks.id(entryId);

  if (!portfolioLink) {
    return null;
  }

  const removedPortfolioLink = portfolioLink.toObject({
    virtuals: false,
    versionKey: false,
  });

  profile.portfolioLinks.pull(entryId);

  await profile.save();

  return removedPortfolioLink;
};

export const getProfileCompletionByUserId = async (userId) => {
  const profile = await JobSeekerProfile.findOne({
    user: userId,
  })
    .lean()
    .exec();

  return calculateProfileCompletion(profile);
};
