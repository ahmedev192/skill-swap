import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, User as ApiUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location: string;
  languages: string[];
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to transform API user to local user format
const transformApiUserToLocalUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    bio: apiUser.bio,
    profilePhoto: apiUser.profileImageUrl,
    location: apiUser.location || '',
    languages: apiUser.preferredLanguage ? [apiUser.preferredLanguage] : ['English'],
    timeZone: apiUser.timeZone || 'UTC',
    isEmailVerified: apiUser.isEmailVerified,
    isIdVerified: apiUser.isIdVerified,
    peerEndorsements: 0, // This would need to be added to the API
    rating: apiUser.averageRating,
    totalSessions: apiUser.totalReviews, // Using totalReviews as proxy for sessions
    joinedAt: apiUser.createdAt,
    isOnline: true, // This would need to be tracked separately
    lastActive: apiUser.lastActiveAt || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          // Try to get current user with existing token
          const userData = await authService.getCurrentUser();
          setUser(transformApiUserToLocalUser(userData));
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            const authResponse = await authService.refreshToken(refreshToken);
            localStorage.setItem('token', authResponse.token);
            localStorage.setItem('refreshToken', authResponse.refreshToken);
            setUser(transformApiUserToLocalUser(authResponse.user));
          } catch (refreshError) {
            // Both tokens are invalid, clear them
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting login process');
      const authResponse = await authService.login({ email, password });
      console.log('AuthContext: Login successful, storing tokens');
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      setUser(transformApiUserToLocalUser(authResponse.user));
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid login data');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
    setIsLoading(false);
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        location: userData.location,
        preferredLanguage: userData.languages[0] || 'English',
        referralCode: userData.referralCode,
      });
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      setUser(transformApiUserToLocalUser(authResponse.user));
    } catch (error: any) {
      console.error('AuthContext: Registration failed:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        // Extract error message from the response
        const errorMessage = error.response.data?.message || 'Invalid registration data';
        throw new Error(errorMessage);
      } else if (error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        // For other errors, try to extract the message from the response
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    }
    setIsLoading(false);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        // Ignore logout errors
      }
    }
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        location: userData.location,
        profileImageUrl: userData.profilePhoto,
        timeZone: userData.timeZone,
        preferredLanguage: userData.languages?.[0],
      });
      setUser(transformApiUserToLocalUser(updatedUser));
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};