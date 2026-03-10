import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const newsService = {
  getNews: (page = 1, category = null, limit = 10) => {
    const params = { page, limit };
    if (category && category !== 'All') params.category = category;
    return api.get('/news', { params });
  },

  getNewsById: (id) => api.get(`/news/${id}`),

  getFeatured: () => api.get('/news/featured'),

  search: (q) => api.get('/news/search', { params: { q } }),

  registerFCMToken: (token, platform = 'android') =>
    api.post('/notifications/register-token', { token, platform }),
};

export default api;
