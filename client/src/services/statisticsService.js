import apiClient from './apiClient.js';

export const getEmployerStatistics = async () => {
  const { data } = await apiClient.get('/statistics/employer');
  return data.data.statistics;
};

export const getJobSeekerStatistics = async () => {
  const { data } = await apiClient.get('/statistics/job-seeker');
  return data.data.statistics;
};

export const getAdminStatistics = async () => {
  const { data } = await apiClient.get('/statistics/admin');
  return data.data.statistics;
};
