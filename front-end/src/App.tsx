import React, { useState } from 'react';
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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [resetPasswordData, setResetPasswordData] = useState<{ userId: string; token: string } | null>(null);
  const [preselectedSkill, setPreselectedSkill] = useState<UserSkill | null>(null);

  // Check for reset password parameters in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const token = urlParams.get('token');
    
    if (userId && token) {
      setResetPasswordData({ userId, token });
      setAuthMode('reset-password');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {authMode === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setAuthMode('register')} 
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        )}
        {authMode === 'register' && (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
        {authMode === 'forgot-password' && (
          <ForgotPasswordForm onBackToLogin={() => setAuthMode('login')} />
        )}
        {authMode === 'reset-password' && resetPasswordData && (
          <ResetPasswordForm 
            userId={resetPasswordData.userId}
            token={resetPasswordData.token}
            onSuccess={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  // Function to handle navigation with preselected skill
  const handleViewChangeWithSkill = (view: string, skill?: UserSkill) => {
    setCurrentView(view);
    setPreselectedSkill(skill || null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'skills':
        return <SkillsPage onViewChange={handleViewChangeWithSkill} />;
      case 'profile':
        return <ProfilePage />;
      case 'wallet':
        return <WalletPage />;
      case 'chat':
        return <ChatPage onViewChange={setCurrentView} />;
      case 'bookings':
        return <BookingsPage preselectedSkill={preselectedSkill} onViewChange={setCurrentView} />;
      case 'admin':
        return <AdminDashboard />;
      case 'reviews':
        return <ReviewsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'users':
        return <UserSearchPage />;
      case 'book-session':
        return <BookSessionPage />;
      case 'manage-skills':
        return <ManageSkillsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'community':
        return <CommunityPage />;
      case 'connections':
        return <ConnectionsPage onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main>
        {renderCurrentView()}
      </main>
      <NotificationSystem />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;