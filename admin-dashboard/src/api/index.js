import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ashoka-news-backend.onrender.com/api';

const api = axios.create({ baseURL: API_BASE });

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ashoka_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ashoka_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/admin/login', data),
  me: () => api.get('/admin/me'),
  dashboard: () => api.get('/admin/dashboard'),
  changePassword: (data) => api.put('/admin/change-password', data)
};

export const newsAPI = {
  getAll: (params) => api.get('/news/admin/all', { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/news/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/news/${id}`),
  togglePublish: (id) => api.patch(`/news/${id}/publish`)
};

export default api;
