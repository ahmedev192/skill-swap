import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { getApiUrl, API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = getApiUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track concurrent requests to prevent overwhelming the server
let concurrentRequests = 0;
const MAX_CONCURRENT_REQUESTS = 10;

// Debug logging
console.log('API Base URL:', API_BASE_URL);
console.log('API Config:', API_CONFIG);

// Request interceptor to add auth token and manage concurrent requests
api.interceptors.request.use(
  (config) => {
    // Check concurrent request limit
    if (concurrentRequests >= MAX_CONCURRENT_REQUESTS) {
      console.warn('Too many concurrent requests, queuing request');
      return new Promise((resolve) => {
        setTimeout(() => {
          concurrentRequests++;
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          resolve(config);
        }, 100);
      });
    }
    
    concurrentRequests++;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    concurrentRequests = Math.max(0, concurrentRequests - 1);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    concurrentRequests = Math.max(0, concurrentRequests - 1);
    return response;
  },
  (error) => {
    concurrentRequests = Math.max(0, concurrentRequests - 1);
    
    // Log the error for debugging
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    console.error('Error config:', error.config);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      // Don't redirect here - let the component handle it
    }
    
    // Handle network errors specifically
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INSUFFICIENT_RESOURCES') {
      console.warn('Network error detected, this might be due to too many concurrent requests');
      // Add a small delay to prevent rapid retries
      return new Promise((_, reject) => {
        setTimeout(() => reject(error), 1000);
      });
    }
    
    // Return the error as-is for components to handle with the new error handling system
    return Promise.reject(error);
  }
);

export default api;
