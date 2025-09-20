import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationSystem from './components/common/NotificationSystem';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import Dashboard from './components/dashboard/Dashboard';
import SkillsPage from './components/skills/SkillsPage';
import ProfilePage from './components/profile/ProfilePage';
import WalletPage from './components/wallet/WalletPage';
import ChatPage from './components/chat/ChatPage';
import BookingsPage from './components/bookings/BookingsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ReviewsPage from './components/reviews/ReviewsPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import UserSearchPage from './components/users/UserSearchPage';
import BookSessionPage from './components/sessions/BookSessionPage';
import ManageSkillsPage from './components/skills/ManageSkillsPage';
import SettingsPage from './components/settings/SettingsPage';
import CommunityPage from './components/community/CommunityPage';
import ConnectionsPage from './components/connections/ConnectionsPage';
import { UserSkill } from './services/skillsService';
import { setGlobalNavigate } from './utils/navigation';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return <>{children}</>;
};

// Auth Route Component
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main>
        {children}
      </main>
      <NotificationSystem />
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set global navigate function for use in services
  React.useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);
  
  // Check for reset password parameters in URL
  const urlParams = new URLSearchParams(location.search);
  const userId = urlParams.get('userId');
  const token = urlParams.get('token');
  const isResetPassword = userId && token;

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <AuthRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <LoginForm />
          </div>
        </AuthRoute>
      } />
      
      <Route path="/register" element={
        <AuthRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <RegisterForm />
          </div>
        </AuthRoute>
      } />
      
      <Route path="/forgot-password" element={
        <AuthRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ForgotPasswordForm />
          </div>
        </AuthRoute>
      } />
      
      <Route path="/reset-password" element={
        <AuthRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {isResetPassword ? (
              <ResetPasswordForm 
                userId={userId!}
                token={token!}
                onSuccess={() => navigate('/login')}
              />
            ) : (
              <Navigate to="/login" replace />
            )}
          </div>
        </AuthRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/skills" element={
        <ProtectedRoute>
          <MainLayout>
            <SkillsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/wallet" element={
        <ProtectedRoute>
          <MainLayout>
            <WalletPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/chat" element={
        <ProtectedRoute>
          <MainLayout>
            <ChatPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/bookings" element={
        <ProtectedRoute>
          <MainLayout>
            <BookingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reviews" element={
        <ProtectedRoute>
          <MainLayout>
            <ReviewsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <MainLayout>
            <UserSearchPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/book-session" element={
        <ProtectedRoute>
          <MainLayout>
            <BookSessionPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/manage-skills" element={
        <ProtectedRoute>
          <MainLayout>
            <ManageSkillsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/community" element={
        <ProtectedRoute>
          <MainLayout>
            <CommunityPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/connections" element={
        <ProtectedRoute>
          <MainLayout>
            <ConnectionsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <ErrorProvider>
            <AuthProvider>
              <MessagingProvider>
                <ConnectionProvider>
                  <AppContent />
                </ConnectionProvider>
              </MessagingProvider>
            </AuthProvider>
          </ErrorProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;