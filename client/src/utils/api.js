import axios from 'axios';
import { mockUsers, mockVisits, getCurrentMockUser, generateId } from './mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock mode toggle - can be controlled via localStorage
const isMockMode = () => {
  const mockMode = localStorage.getItem('mockMode');
  return mockMode === 'true';
};

// Toggle mock mode on/off
export const toggleMockMode = () => {
  const currentMode = isMockMode();
  localStorage.setItem('mockMode', (!currentMode).toString());
  return !currentMode;
};

// Get current mock mode status
export const getMockMode = () => isMockMode();

// Initialize mock mode to true by default for testing
if (localStorage.getItem('mockMode') === null) {
  localStorage.setItem('mockMode', 'true');
}

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
    if (error.response?.status === 401 && !isMockMode()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data storage in localStorage
const getMockStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setMockStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize mock storage
if (!localStorage.getItem('mockUsers')) {
  setMockStorage('mockUsers', mockUsers);
}
if (!localStorage.getItem('mockVisits')) {
  setMockStorage('mockVisits', mockVisits);
}

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementations
const mockAuthAPI = {
  login: async (credentials) => {
    await delay();
    const users = getMockStorage('mockUsers', mockUsers);
    const user = users.find(u => u.email === credentials.email);

    if (user) {
      const token = 'mock-jwt-token-' + user._id;
      return {
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    await delay();
    const users = getMockStorage('mockUsers', mockUsers);
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setMockStorage('mockUsers', users);

    const token = 'mock-jwt-token-' + newUser._id;
    return {
      data: {
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    };
  },

  getMe: async () => {
    await delay();
    const user = getCurrentMockUser();
    return { data: user };
  }
};

const mockUserAPI = {
  getAll: async () => {
    await delay();
    const users = getMockStorage('mockUsers', mockUsers);
    return { data: users };
  },

  create: async (userData) => {
    await delay();
    const users = getMockStorage('mockUsers', mockUsers);
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setMockStorage('mockUsers', users);
    return { data: newUser };
  },

  delete: async (id) => {
    await delay();
    const users = getMockStorage('mockUsers', mockUsers);
    const filtered = users.filter(u => u._id !== id);
    setMockStorage('mockUsers', filtered);
    return { data: { success: true } };
  }
};

const mockVisitAPI = {
  create: async (formData) => {
    await delay();
    const visits = getMockStorage('mockVisits', mockVisits);
    const currentUser = getCurrentMockUser();

    // For mock mode, use a placeholder image URL
    const newVisit = {
      _id: generateId(),
      userId: { _id: currentUser._id, name: currentUser.name },
      placeName: formData.get('placeName'),
      location: {
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude'))
      },
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      createdAt: new Date().toISOString()
    };

    visits.unshift(newVisit);
    setMockStorage('mockVisits', visits);
    return { data: newVisit };
  },

  getMyVisits: async () => {
    await delay();
    const visits = getMockStorage('mockVisits', mockVisits);
    const currentUser = getCurrentMockUser();
    const myVisits = visits.filter(v => v.userId._id === currentUser._id);
    return { data: myVisits };
  },

  getAllVisits: async () => {
    await delay();
    const visits = getMockStorage('mockVisits', mockVisits);
    return { data: visits };
  },

  getUserVisits: async (userId) => {
    await delay();
    const visits = getMockStorage('mockVisits', mockVisits);
    const userVisits = visits.filter(v => v.userId._id === userId);
    return { data: userVisits };
  },

  delete: async (id) => {
    await delay();
    const visits = getMockStorage('mockVisits', mockVisits);
    const filtered = visits.filter(v => v._id !== id);
    setMockStorage('mockVisits', filtered);
    return { data: { success: true } };
  }
};

// Export API with mock mode support
export const authAPI = {
  login: (credentials) => isMockMode() ? mockAuthAPI.login(credentials) : api.post('/auth/login', credentials),
  register: (userData) => isMockMode() ? mockAuthAPI.register(userData) : api.post('/auth/register', userData),
  getMe: () => isMockMode() ? mockAuthAPI.getMe() : api.get('/auth/me'),
};

export const userAPI = {
  getAll: () => isMockMode() ? mockUserAPI.getAll() : api.get('/users'),
  create: (userData) => isMockMode() ? mockUserAPI.create(userData) : api.post('/users', userData),
  delete: (id) => isMockMode() ? mockUserAPI.delete(id) : api.delete(`/users/${id}`),
};

export const visitAPI = {
  create: (formData) => isMockMode() ? mockVisitAPI.create(formData) : api.post('/visits', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyVisits: () => isMockMode() ? mockVisitAPI.getMyVisits() : api.get('/visits/my-visits'),
  getAllVisits: () => isMockMode() ? mockVisitAPI.getAllVisits() : api.get('/visits/all'),
  getUserVisits: (userId) => isMockMode() ? mockVisitAPI.getUserVisits(userId) : api.get(`/visits/user/${userId}`),
  delete: (id) => isMockMode() ? mockVisitAPI.delete(id) : api.delete(`/visits/${id}`),
};

export default api;
