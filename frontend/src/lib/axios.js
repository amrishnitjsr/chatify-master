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

// Add response interceptor for logging (development only)
axiosInstance.interceptors.response.use(
  (response) => {
    devUtils.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    devUtils.error('API Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);
