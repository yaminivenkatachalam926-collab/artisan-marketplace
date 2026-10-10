import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export default api;
