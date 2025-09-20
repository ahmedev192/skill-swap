import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useMessaging } from '../../contexts/MessagingContext';
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
  ChevronDown,
  GraduationCap,
  Heart
} from 'lucide-react';
import { notificationsService } from '../../services/notificationsService';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount: messageUnreadCount, onUnreadCountsUpdated } = useMessaging();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Load unread notification count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) return;
      
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count.unreadCount);
      } catch (error) {
        console.error('Error loading unread count:', error);
        // Set to 0 if there's an error (e.g., 404)
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, [user]);

  // Listen for real-time unread count updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onUnreadCountsUpdated((messageCount: number, notificationCount: number) => {
      setUnreadCount(notificationCount);
    });

    return unsubscribe;
  }, [user, onUnreadCountsUpdated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Organized navigation groups
  const navigationGroups = [
    {
      id: 'main',
      label: 'Main',
      icon: Home,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'community', label: 'Community', icon: Users },
      ]
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: GraduationCap,
      items: [
        { id: 'skills', label: 'Discover Skills', icon: Search },
        { id: 'manage-skills', label: 'My Skills', icon: BookOpen },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
      ]
    },
    {
      id: 'social',
      label: 'Social',
      icon: Heart,
      items: [
        { id: 'connections', label: 'Connections', icon: UserPlus },
        { id: 'chat', label: 'Messages', icon: MessageCircle },
        { id: 'reviews', label: 'Reviews', icon: Star },
      ]
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      items: [
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Add admin group if user is admin
  if (user?.role === 'Admin') {
    navigationGroups.push({
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      items: [
        { id: 'admin', label: 'Admin Panel', icon: Shield },
      ]
    });
  }

  // Flatten all items for mobile menu
  const allNavItems = navigationGroups.flatMap(group => group.items);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => onViewChange('dashboard')}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer"
                title="Go to Dashboard"
              >
                SkillSwap
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1">
              {navigationGroups.map((group) => {
                const GroupIcon = group.icon;
                const isActive = group.items.some(item => item.id === currentView);
                const isDropdownOpen = activeDropdown === group.id;
                
                return (
                  <div key={group.id} className="relative dropdown-container">
                    <button
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : group.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <GroupIcon size={18} />
                      <span>{group.label}</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = currentView === item.id;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                onViewChange(item.id);
                                setActiveDropdown(null);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors relative ${
                                isItemActive
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <ItemIcon size={18} />
                              <span className="flex-1">{item.label}</span>
                              {item.id === 'chat' && messageUnreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tablet Navigation - Simplified */}
          <div className="hidden md:block lg:hidden">
            <div className="ml-6 flex items-center space-x-2">
              {allNavItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors relative ${
                      currentView === item.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
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
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="More"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button 
              onClick={() => onViewChange('notifications')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

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
                onClick={() => onViewChange('profile')}
                className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                title="View Profile"
              >
                <User size={20} />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            {navigationGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3 rounded-lg text-base font-medium flex items-center space-x-3 transition-colors relative ${
                        currentView === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
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
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="px-3 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>Switch Theme</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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