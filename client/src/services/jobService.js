import apiClient from './apiClient.js';

export const createJob = async (payload) => {
  const { data } = await apiClient.post('/employer/jobs', payload);
  return data;
};

export const getEmployerJobs = async () => {
  const { data } = await apiClient.get('/employer/jobs');
  return data;
};

export const getEmployerJobById = async (jobId) => {
  const { data } = await apiClient.get(`/employer/jobs/${jobId}`);
  return data;
};

export const updateJob = async (jobId, payload) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await apiClient.delete(`/employer/jobs/${jobId}`);
  return data;
};

export const submitJobForReview = async (jobId) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/submit-for-review`);
  return data;
};

export const closeJob = async (jobId, reason) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/close`, { reason });
  return data;
};

export const reopenJob = async (jobId, deadline) => {
  const { data } = await apiClient.patch(`/employer/jobs/${jobId}/reopen`, { deadline });
  return data;
};
