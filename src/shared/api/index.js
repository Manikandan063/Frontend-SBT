import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  const isAdminRoute = path.includes('admin') || path.includes('superadmin') || path.includes('school');
  
  let token = null;
  if (isAdminRoute) {
    token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  } else {
    token = localStorage.getItem('parent_token') || localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Response Interceptor for Auth Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isLoginPage = window.location.pathname === '/' || window.location.pathname.includes('/login');
      if (!isLoginPage) {
        console.error('[AUTH] Critical Auth Failure. Clearing session and redirecting...');
        const path = window.location.pathname;
        const isAdminRoute = path.includes('admin') || path.includes('superadmin') || path.includes('school');
        
        if (isAdminRoute) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          localStorage.removeItem('parent_token');
          localStorage.removeItem('parent_user');
          localStorage.removeItem('selectedChildId');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        if (path.includes('superadmin')) {
          window.location.href = '/superadmin/login';
        } else if (path.includes('school') || path.includes('admin')) {
          window.location.href = '/schooladmin/login';
        } else {
          window.location.href = '/'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Admin Service Structure
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const schoolService = {
  getSchools: () => api.get('/schools'),
  createSchool: (data) => api.post('/schools', data),
  updateSchool: (id, data) => api.put(`/schools/${id}`, data),
  deleteSchool: (id) => api.delete(`/schools/${id}`),
};

export const studentService = {
  getStudents: () => api.get('/students'),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

export const busService = {
  getBuses: () => api.get('/bus'),
  updateBus: (id, data) => api.put(`/bus/${id}`, data),
};

export const trackingService = {
  getLiveLocation: (busId) => api.get(`/tracking/live-location/${busId}`),
};
