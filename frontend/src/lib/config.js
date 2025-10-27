// =====================================
// FRONTEND CONFIGURATION HELPER
// =====================================

/**
 * Centralized configuration for frontend application
 * Uses environment variables with fallback defaults
 */

export const config = {
  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Chatify',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    mode: import.meta.env.VITE_APP_MODE || import.meta.env.MODE || 'development',
  },

  // API Configuration
  api: {
    baseURL: getApiBaseUrl(),
    timeout: 10000, // 10 seconds
  },

  // Socket Configuration
  socket: {
    url: getSocketUrl(),
    options: {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    },
  },

  // Development Configuration
  dev: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    showLogs: import.meta.env.VITE_SHOW_LOGS === 'true',
  },
};

/**
 * Get the API base URL from environment variables
 */
function getApiBaseUrl() {
  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default behavior based on mode
  return import.meta.env.MODE === "development" 
    ? "http://localhost:3000/api" 
    : "/api";
}

/**
 * Get the socket URL from environment variables
 */
function getSocketUrl() {
  // If VITE_SOCKET_URL is set, use it
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // Default behavior based on mode
  return import.meta.env.MODE === "development" 
    ? "http://localhost:3000" 
    : "/";
}

/**
 * Development helper functions
 */
export const devUtils = {
  log: (...args) => {
    if (config.dev.debugMode && config.dev.showLogs) {
      console.log('[CHATIFY]', ...args);
    }
  },
  
  error: (...args) => {
    if (config.dev.debugMode) {
      console.error('[CHATIFY ERROR]', ...args);
    }
  },
  
  warn: (...args) => {
    if (config.dev.debugMode) {
      console.warn('[CHATIFY WARNING]', ...args);
    }
  },
};

export default config;