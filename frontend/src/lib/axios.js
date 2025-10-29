import axios from "axios";
import { config, devUtils } from "./config.js";

export const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: true,
});

// Add request interceptor for logging (development only)
axiosInstance.interceptors.request.use(
  (config) => {
    devUtils.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    devUtils.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and auth error handling
axiosInstance.interceptors.response.use(
  (response) => {
    devUtils.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const errorCode = error.response?.data?.code;
    
    devUtils.error('API Response Error:', status, url, errorCode);
    
    // Handle authentication errors more gracefully
    if (status === 401 && errorCode) {
      console.warn(`🔐 Auth issue (${errorCode}):`, error.response.data.message);
      
      // Don't auto-logout on auth errors during initial setup
      // Let the calling code handle retries first
      if (!url?.includes('/auth/check') && !url?.includes('/notifications/unread-count')) {
        console.warn('🔐 Non-critical auth error, allowing retry');
      }
    }
    
    return Promise.reject(error);
  }
);
