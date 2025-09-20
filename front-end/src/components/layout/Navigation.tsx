import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useMessaging } from '../../contexts/MessagingContext';
import NotificationsNav from '../Notifications/NotificationsNav';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  MessageCircle, 
  Calendar, 
  Wallet, 
  User, 
  Settings,
  Sun,
  Moon,
  Bell,
  LogOut,
  Users,
  Star,
  Shield,
  BookOpen,
  UserPlus,
  GraduationCap,
  Heart,
  Sparkles
} from 'lucide-react';
import { notificationsService } from '../../services/notificationsService';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount: messageUnreadCount, onUnreadCountsUpdated } = useMessaging();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current view from the URL path
  const currentView = location.pathname.substring(1) || 'dashboard';

  // All navigation items with visual grouping
  const navigationItems = [
    // Main section
    { id: 'dashboard', label: 'Dashboard', icon: Home, group: 'main', color: 'blue' },
    { id: 'community', label: 'Community', icon: Users, group: 'main', color: 'blue' },
    
    // Learning section
    { id: 'skills', label: 'Discover Skills', icon: Search, group: 'learning', color: 'emerald' },
    { id: 'manage-skills', label: 'My Skills', icon: BookOpen, group: 'learning', color: 'emerald' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, group: 'learning', color: 'emerald' },
    
    // Social section
    { id: 'connections', label: 'Connections', icon: UserPlus, group: 'social', color: 'purple' },
    { id: 'chat', label: 'Messages', icon: MessageCircle, group: 'social', color: 'purple' },
    { id: 'reviews', label: 'Reviews', icon: Star, group: 'social', color: 'purple' },
    
    // Account section
    { id: 'wallet', label: 'Wallet', icon: Wallet, group: 'account', color: 'amber' },
    { id: 'settings', label: 'Settings', icon: Settings, group: 'account', color: 'amber' },
  ];

  // Add admin item if user is admin
  if (user?.role === 'Admin') {
    navigationItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield, group: 'admin', color: 'red' });
  }

  // Helper function to get color classes
  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: isActive 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 border-transparent hover:border-blue-200 dark:hover:border-blue-700',
      emerald: isActive 
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 border-transparent hover:border-emerald-200 dark:hover:border-emerald-700',
      purple: isActive 
        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 border-transparent hover:border-purple-200 dark:hover:border-purple-700',
      amber: isActive 
        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 border-transparent hover:border-amber-200 dark:hover:border-amber-700',
      red: isActive 
        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 border-transparent hover:border-red-200 dark:hover:border-red-700',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo with enhanced styling - positioned at the very left */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
              title="Go to Dashboard"
            >
              <Sparkles size={28} className="text-blue-600 dark:text-blue-400" />
              <span>SkillSwap</span>
            </button>
          </div>

          {/* Desktop Navigation - All items visible */}
          <div className="hidden lg:block flex-1">
            <div className="flex items-center justify-center space-x-3">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const colorClasses = getColorClasses(item.color, isActive);
                
                return (
                  <React.Fragment key={item.id}>
                    <button
                      onClick={() => navigate(`/${item.id}`)}
                      className={`px-5 py-3 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 border-2 ${colorClasses} relative group`}
                      title={item.label}
                    >
                      <Icon size={18} />
                      <span className="hidden xl:block">{item.label}</span>
                      {item.id === 'chat' && messageUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                        </span>
                      )}
                      {/* Tooltip for icon-only mode */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none xl:hidden">
                        {item.label}
                      </div>
                    </button>
                    
                    {/* Visual separator between groups */}
                    {index < navigationItems.length - 1 && 
                     navigationItems[index + 1]?.group !== item.group && (
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-3"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Tablet Navigation - Show most important items */}
          <div className="hidden md:block lg:hidden flex-1">
            <div className="flex items-center justify-center space-x-3">
              {navigationItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const colorClasses = getColorClasses(item.color, isActive);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/${item.id}`)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${colorClasses} relative`}
                    title={item.label}
                  >
                    <Icon size={18} />
                    {item.id === 'chat' && messageUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                title="More"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <NotificationsNav />

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.rating?.toFixed(1)} ⭐
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="View Profile"
              >
                <User size={20} />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border-2 border-transparent hover:border-red-200 dark:hover:border-red-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Group navigation items by category */}
            {['main', 'learning', 'social', 'account', 'admin'].map((group) => {
              const groupItems = navigationItems.filter(item => item.group === group);
              if (groupItems.length === 0) return null;
              
              return (
                <div key={group} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group === 'main' && 'Main'}
                    {group === 'learning' && 'Learning'}
                    {group === 'social' && 'Social'}
                    {group === 'account' && 'Account'}
                    {group === 'admin' && 'Admin'}
                  </div>
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const colorClasses = getColorClasses(item.color, isActive);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(`/${item.id}`);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-6 py-3 rounded-lg text-base font-medium flex items-center space-x-3 transition-all duration-200 border-2 ${colorClasses} relative`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                        {item.id === 'chat' && messageUnreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="px-3 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>Switch Theme</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;