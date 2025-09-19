// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:51423/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// SignalR Configuration
export const SIGNALR_CONFIG = {
  HUB_URL: 'http://localhost:51423/notificationHub',
};

// Environment-specific configuration
export const getApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to localhost for development
  return API_CONFIG.BASE_URL;
};

export const getSignalRUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_SIGNALR_URL) {
    return import.meta.env.VITE_SIGNALR_URL;
  }
  
  // Default to localhost for development
  return SIGNALR_CONFIG.HUB_URL;
};
