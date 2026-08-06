import JobSeekerProfile from '../models/JobSeekerProfile.js';
import {
  educationRecordSchema,
  experienceRecordSchema,
} from '../validations/jobSeekerProfile.validation.js';

const editableProfileFields = ['currentPosition', 'careerSummary', 'location'];

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
