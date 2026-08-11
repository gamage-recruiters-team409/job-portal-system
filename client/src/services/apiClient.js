import axios from 'axios';
import { authStorage } from '../config/authStorage.js';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = envUrl && !envUrl.includes(':5000') ? envUrl : 'http://localhost:5001/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach the persisted session token to every request when present.
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
