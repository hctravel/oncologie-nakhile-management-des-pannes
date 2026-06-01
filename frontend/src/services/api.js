import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add dummy token to requests (authentication disabled)
api.interceptors.request.use(
  (config) => {
    // Use dummy token for demo - authentication is disabled
    config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8tdXNlciIsIm5hbWUiOiJBZG1pbiBEZW1vIiwiZW1haWwiOiJhZG1pbkBkZW1vLmNvbSIsInJvbGUiOiJzdXBlciBhZG1pbiJ9.dummy`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Simplified response handling
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
