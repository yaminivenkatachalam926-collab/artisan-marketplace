import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ 
  baseURL,
  headers: {
    'Accept': 'application/json',
  }
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (response) => {
    // Detect if Vercel SPA rewritten an endpoint into index.html
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype') || response.data.includes('<html'))
    ) {
      return Promise.reject(new Error('API endpoint returned HTML index rather than JSON response.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export default api;
