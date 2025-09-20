import { NavigateFunction } from 'react-router-dom';

// Global navigation function - will be set by the app
let globalNavigate: NavigateFunction | null = null;

export const setGlobalNavigate = (navigate: NavigateFunction) => {
  globalNavigate = navigate;
};

export const navigateTo = (path: string) => {
  if (globalNavigate) {
    globalNavigate(path);
  } else {
    // Fallback to window.location if router is not available
    window.location.href = path;
  }
};

export const navigateToLogin = () => {
  navigateTo('/login');
};

export const navigateToDashboard = () => {
  navigateTo('/dashboard');
};

export const navigateToHome = () => {
  navigateTo('/dashboard');
};
