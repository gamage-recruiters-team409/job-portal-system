import apiClient from './apiClient.js';

export const getMyCompany = async () => {
  const { data } = await apiClient.get('/companies/me');
  return data;
};

export const uploadCompanyLogo = async (file) => {
  const formData = new FormData();
  formData.append('companyLogo', file);

  const { data } = await apiClient.put('/companies/me/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
