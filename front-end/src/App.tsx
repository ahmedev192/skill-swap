import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState('dashboard');

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
        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'skills':
        return <SkillsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'wallet':
        return <WalletPage />;
      case 'chat':
        return <ChatPage />;
      case 'bookings':
        return <BookingsPage />;
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
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;