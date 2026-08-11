import apiClient from './apiClient.js';

export const submitReport = async ({ jobId, reason, description }) => {
  const { data } = await apiClient.post('/reports', {
    jobId,
    reason,
    description,
  });

  return data;
};

export const getMyReports = async () => {
  const { data } = await apiClient.get('/reports/my-reports');

  return data;
};

export const getReportById = async (reportId) => {
  const { data } = await apiClient.get(`/reports/${reportId}`);

  return data;
};