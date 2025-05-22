import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    // if (error.response?.status === 401) {
    //   // Clear auth data and redirect to login
    //   localStorage.removeItem('auth_token');
    //   localStorage.removeItem('auth_user');
      
    //   // If not already on login page, redirect
    //   if (window.location.pathname !== '/login') {
    //     window.location.href = '/login';
    //   }
    // }
    return Promise.reject(error);
  }
);

export default api; 