// =====================================
// FRONTEND CONFIGURATION HELPER (Fixed)
// =====================================

import axios from "axios";

// =======================
// Helper Functions
// =======================

function getApiBaseUrl() {
    // Force local development when running in dev mode
    if (import.meta.env.MODE === "development") {
        return "http://localhost:3000/api";
    }

    // Use environment variable for production or fallback
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Production fallback
    return "https://chatify-67td.onrender.com/api";
}

function getSocketUrl() {
    // Force local development when running in dev mode
    if (import.meta.env.MODE === "development") {
        return "http://localhost:3000";
    }

    // Use environment variable for production or fallback
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }

    // Production fallback
    return "/";
}

// =======================
// Main Config Object
// =======================

export const config = {
    // App Information
    app: {
        name: import.meta.env.VITE_APP_NAME || "Chatify",
        version: import.meta.env.VITE_APP_VERSION || "1.0.0",
        mode: import.meta.env.VITE_APP_MODE || import.meta.env.MODE || "development",
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
            transports: ["websocket", "polling"],
        },
    },

    // Development Configuration
    dev: {
        debugMode: import.meta.env.VITE_DEBUG_MODE === "true",
        showLogs: import.meta.env.VITE_SHOW_LOGS === "true",
    },
};

// =======================
// Axios Global Setup ✅
// =======================

axios.defaults.baseURL = config.api.baseURL;
axios.defaults.timeout = config.api.timeout;
axios.defaults.withCredentials = true; // ✅ Critical: ensures JWT cookies are sent

// Optional: Add global interceptors for debugging
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (config.dev.debugMode) {
            console.error("[CHATIFY ERROR]", error?.response?.status, error?.config?.url);
        }
        return Promise.reject(error);
    }
);

// =======================
// Development Utils
// =======================

export const devUtils = {
    log: (...args) => {
        if (config.dev.debugMode && config.dev.showLogs) {
            console.log("[CHATIFY]", ...args);
        }
    },
    error: (...args) => {
        if (config.dev.debugMode) {
            console.error("[CHATIFY ERROR]", ...args);
        }
    },
    warn: (...args) => {
        if (config.dev.debugMode) {
            console.warn("[CHATIFY WARNING]", ...args);
        }
    },
};

export default config;
