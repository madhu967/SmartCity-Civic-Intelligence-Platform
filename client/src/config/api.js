const resolveApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1');

  // If explicitly forced to use production API even while testing on localhost:
  if (import.meta.env.VITE_USE_PROD_API === 'true') {
    return import.meta.env.VITE_API_BASE_URL || '';
  }

  // When running in the browser on localhost, automatically connect to local backend
  if (isLocalhost) {
    return import.meta.env.VITE_LOCAL_API_BASE_URL || 'http://localhost:5000';
  }

  // When deployed (Vercel, Netlify, custom domain), use deployed backend
  return import.meta.env.VITE_API_BASE_URL || '';
};

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/+$/, '');
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