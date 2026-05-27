import api from './axios';

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const parentLogin = async (mobileNumber, password, force = false) => {
  // Sanitize mobile number (remove spaces, dashes, etc.)
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  const deviceId = getOrCreateDeviceId();
  
  const response = await api.post('/parents/login', { 
    mobileNumber: cleanMobile, 
    password,
    force,
    deviceId
  });
  const { token, parent } = response.data;
  
  // Store token and user info (Namespaced for Parent)
  localStorage.setItem('parent_token', token);
  localStorage.setItem('parent_user', JSON.stringify({ ...parent, role: 'parent' }));
  
  return { token, parent };
};

export const logout = async () => {
  try {
    const deviceId = localStorage.getItem('deviceId');
    await api.post('/parents/logout', { deviceId }).catch(() => {});
  } catch (err) {
    // Ignore errors during logout
  }
  localStorage.removeItem('parent_token');
  localStorage.removeItem('parent_user');
  localStorage.removeItem('selectedChildId');
  // Removed sessionStorage.clear() to prevent logging out SuperAdmin/SchoolAdmin
};

export const getStoredParent = () => {
  const user = localStorage.getItem('parent_user') || localStorage.getItem('user'); // Fallback for old sessions
  const parsed = user ? JSON.parse(user) : null;
  return parsed?.role === 'parent' ? parsed : null;
};
