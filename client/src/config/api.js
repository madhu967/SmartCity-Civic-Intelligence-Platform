export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PREFIX = '/api';

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('smart_city_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const redirectToDashboard = () => {
  window.history.pushState({}, '', '/dashboard');
  window.dispatchEvent(new PopStateEvent('popstate'));
};