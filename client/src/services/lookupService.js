import apiClient from './apiClient.js';

export const getCategories = async () => {
  const { data } = await apiClient.get('/categories');
  return data;
};

export const getSkills = async () => {
  const { data } = await apiClient.get('/skills');
  return data;
};
