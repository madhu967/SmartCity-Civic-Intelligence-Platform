export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PREFIX = '/api';

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.details = data.details;
    throw error;
  }

  return data;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('smart_city_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const redirectToDashboard = (path = '/dashboard') => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};