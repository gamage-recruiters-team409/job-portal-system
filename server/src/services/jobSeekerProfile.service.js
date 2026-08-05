import JobSeekerProfile from '../models/JobSeekerProfile.js';

const editableProfileFields = ['currentPosition', 'careerSummary', 'location'];

const selectEditableProfileFields = (profileData) =>
  Object.fromEntries(
    Object.entries(profileData).filter(([field]) => editableProfileFields.includes(field))
  );

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
