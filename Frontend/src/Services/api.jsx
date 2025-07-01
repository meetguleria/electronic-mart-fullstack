import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Set a timeout of 10 seconds
});

// Request interceptor
api.interceptors.request.use(
	config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Token missing, invalid or expired
        localStorage.removeItem('token');
        // Redirect to sign-in
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
