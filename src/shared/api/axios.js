import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const path = window.location.pathname;
    const isAdminRoute = path.includes('admin') || path.includes('superadmin') || path.includes('school');
    
    // Choose the right token based on context, with fallback to legacy 'token'
    let token = null;
    if (isAdminRoute) {
      token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    } else {
      token = localStorage.getItem('parent_token') || localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Prevent caching to avoid data mismatch between sessions
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry / 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[AXIOS] Unauthorized (401) detected! Session expired. Redirecting...');
      
      const path = window.location.pathname;
      const isAdminRoute = path.includes('admin') || path.includes('superadmin') || path.includes('school');

      // Clear expired credentials based on context
      if (isAdminRoute) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('token'); // clear legacy
        localStorage.removeItem('user'); // clear legacy
      } else {
        localStorage.removeItem('parent_token');
        localStorage.removeItem('parent_user');
        localStorage.removeItem('selectedChildId');
        localStorage.removeItem('token'); // clear legacy
        localStorage.removeItem('user'); // clear legacy
      }
      
      if (path.includes('superadmin')) {
        if (path !== '/superadmin-login') window.location.href = '/superadmin-login';
      } else if (path.includes('admin') || path.includes('school')) {
        if (path !== '/admin-login') window.location.href = '/admin-login';
      } else {
        if (path !== '/login') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
