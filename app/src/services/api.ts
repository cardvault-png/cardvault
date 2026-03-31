import axios from 'axios';
import { mockAxiosAdapter } from './mockApi';

// Determine API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, use relative URL (same origin)
  if (import.meta.env.PROD) {
    return '/api';
  }
  // In development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Check if we should use mock API (when backend is not available)
const USE_MOCK_API = true; // Set to true for demo deployment

console.log('[API] Using API URL:', API_URL);
console.log('[API] Mock API enabled:', USE_MOCK_API);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  // Use mock adapter when backend is not available
  adapter: USE_MOCK_API ? mockAxiosAdapter as any : undefined,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gcp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('[API Response Error]', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Handle network errors (server not running)
    if (!error.response) {
      console.error('[API] Network error - server may not be running');
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Unable to connect to server. Please try again later.',
            code: 'NETWORK_ERROR'
          }
        }
      });
    }

    // Handle token expiration
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      const refreshToken = localStorage.getItem('gcp_refresh_token');
      
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('gcp_token', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('gcp_token');
          localStorage.removeItem('gcp_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle banned account
    if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_BANNED') {
      localStorage.removeItem('gcp_token');
      localStorage.removeItem('gcp_refresh_token');
      window.location.href = '/login?banned=true';
    }

    return Promise.reject(error);
  }
);

export default api;
