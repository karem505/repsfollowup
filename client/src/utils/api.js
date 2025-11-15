import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const visitAPI = {
  create: (formData) => api.post('/visits', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyVisits: () => api.get('/visits/my-visits'),
  getAllVisits: () => api.get('/visits/all'),
  getUserVisits: (userId) => api.get(`/visits/user/${userId}`),
  delete: (id) => api.delete(`/visits/${id}`),
};

export default api;
