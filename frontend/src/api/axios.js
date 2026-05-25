import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('payrollUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// If token expired / unauthorized, clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('payrollUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
