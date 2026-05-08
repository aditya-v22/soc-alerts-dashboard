import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — server unreachable or request never left
      const networkError = new Error('Unable to reach the server. Please try again later.');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    if (error.response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; max-age=0';
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
