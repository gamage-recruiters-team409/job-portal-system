import apiClient from '../../../services/apiClient.js';

export async function getMyProfile() {
  const { data } = await apiClient.get('/job-seeker-profile/me');
  return data.data.profile;
}

export async function updateMyProfile(payload) {
  const { data } = await apiClient.patch('/job-seeker-profile/me', payload);
  return data.data.profile;
}

export async function getMyProfileCompletion() {
  const { data } = await apiClient.get('/job-seeker-profile/me/completion');
  return data.data.completion;
}

export async function getActiveSkills() {
  const { data } = await apiClient.get('/skills');
  return data.data.skills;
}
