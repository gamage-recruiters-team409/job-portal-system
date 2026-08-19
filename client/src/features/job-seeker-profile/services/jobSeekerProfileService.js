import apiClient from '../../../services/apiClient.js';

export async function getMyProfile() {
  const { data } = await apiClient.get('/job-seeker-profile/me');

  return data.data.profile;
}

export async function updateMyProfile(payload) {
  const { data } = await apiClient.patch('/job-seeker-profile/me', payload);

  return data.data.profile;
}

export async function uploadMyProfileImage(file) {
  const formData = new FormData();
  formData.append('profileImage', file);

  const { data } = await apiClient.putForm('/job-seeker-profile/me/profile-image', formData);

  return data.data.profileImage;
}

export async function deleteMyProfileImage() {
  const { data } = await apiClient.delete('/job-seeker-profile/me/profile-image');

  return data.data.profileImage;
}

export async function getMyProfileCompletion() {
  const { data } = await apiClient.get('/job-seeker-profile/me/completion');

  return data.data.completion;
}

export async function getActiveSkills() {
  const { data } = await apiClient.get('/skills');

  return data.data.skills;
}

export async function updateMySkills(skillIds) {
  const { data } = await apiClient.patch('/job-seeker-profile/me/skills', {
    skills: skillIds,
  });

  return data.data.profile;
}

export async function addMyEducation(payload) {
  const { data } = await apiClient.post('/job-seeker-profile/me/education', payload);

  return data.data.education;
}

export async function updateMyEducation(entryId, payload) {
  const { data } = await apiClient.patch(`/job-seeker-profile/me/education/${entryId}`, payload);

  return data.data.education;
}

export async function deleteMyEducation(entryId) {
  const { data } = await apiClient.delete(`/job-seeker-profile/me/education/${entryId}`);

  return data.data.education;
}

export async function addMyExperience(payload) {
  const { data } = await apiClient.post('/job-seeker-profile/me/experience', payload);

  return data.data.experience;
}

export async function updateMyExperience(entryId, payload) {
  const { data } = await apiClient.patch(`/job-seeker-profile/me/experience/${entryId}`, payload);

  return data.data.experience;
}

export async function deleteMyExperience(entryId) {
  const { data } = await apiClient.delete(`/job-seeker-profile/me/experience/${entryId}`);

  return data.data.experience;
}

export async function addMyPortfolioLink(payload) {
  const { data } = await apiClient.post('/job-seeker-profile/me/portfolio', payload);

  return data.data.portfolioLink;
}

export async function updateMyPortfolioLink(entryId, payload) {
  const { data } = await apiClient.patch(`/job-seeker-profile/me/portfolio/${entryId}`, payload);

  return data.data.portfolioLink;
}

export async function deleteMyPortfolioLink(entryId) {
  const { data } = await apiClient.delete(`/job-seeker-profile/me/portfolio/${entryId}`);

  return data.data.portfolioLink;
}

export async function uploadMyCv(file) {
  const formData = new FormData();

  formData.append('cv', file);

  const { data } = await apiClient.putForm('/job-seeker-profile/me/cv', formData);

  return data.data.cv;
}

export async function getMyCvDownloadUrl() {
  const { data } = await apiClient.get('/job-seeker-profile/me/cv/download-url');

  return data.data;
}

export async function deleteMyCv() {
  const { data } = await apiClient.delete('/job-seeker-profile/me/cv');

  return data.data.cv;
}
