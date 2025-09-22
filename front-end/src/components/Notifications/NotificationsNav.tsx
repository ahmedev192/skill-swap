import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Calendar,
  MessageCircle,
  Star,
  Info,
  X,
  MoreHorizontal,
  Filter,
  Settings,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { notificationsService, Notification } from '../../services/notificationsService';

const NotificationsNav: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onUnreadCountsUpdated } = useMessaging();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load recent notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userNotifications = await notificationsService.getNotifications();
        // Show only the 5 most recent notifications in nav
        setNotifications(userNotifications.slice(0, 5));
        const unreadCount = userNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
        console.log('Loaded notifications:', userNotifications.length, 'Unread:', unreadCount);
      } catch (err) {
        console.error('Error loading notifications:', err);
        // Fallback: try to get just the unread count
        try {
          const unreadCountResponse = await notificationsService.getUnreadCount();
          setUnreadCount(unreadCountResponse.unreadCount);
        } catch (countErr) {
          console.error('Error getting unread count:', countErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
    
    // Set up periodic refresh every 30 seconds to ensure counter stays updated
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Refresh notifications when user comes back to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // User came back to the tab, refresh notifications
        const refreshNotifications = async () => {
          try {
            const userNotifications = await notificationsService.getNotifications();
            setNotifications(userNotifications.slice(0, 5));
            const unreadCount = userNotifications.filter(n => !n.isRead).length;
            setUnreadCount(unreadCount);
          } catch (err) {
            console.error('Error refreshing notifications on visibility change:', err);
          }
        };
        refreshNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onUnreadCountsUpdated((messageCount: number, notificationCount: number) => {
      console.log('Real-time update received - Messages:', messageCount, 'Notifications:', notificationCount);
      setUnreadCount(notificationCount);
      
      // Also refresh the notifications list to get the latest data
      const refreshNotifications = async () => {
        try {
          const userNotifications = await notificationsService.getNotifications();
          setNotifications(userNotifications.slice(0, 5));
        } catch (err) {
          console.error('Error refreshing notifications:', err);
        }
      };
      refreshNotifications();
    });

    return unsubscribe;
  }, [user, onUnreadCountsUpdated]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Refresh notifications when the dropdown is opened
  const handleToggleExpanded = async () => {
    if (!isExpanded) {
      // Opening the dropdown - refresh notifications
      try {
        const userNotifications = await notificationsService.getNotifications();
        setNotifications(userNotifications.slice(0, 5));
        const unreadCount = userNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error('Error refreshing notifications:', err);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const getNotificationTypeString = (type: number): string => {
    switch (type) {
      case 1: return 'SessionRequest';
      case 2: return 'SessionConfirmed';
      case 3: return 'SessionReminder';
      case 4: return 'SessionCompleted';
      case 5: return 'Message';
      case 6: return 'Review';
      case 7: return 'CreditEarned';
      case 8: return 'CreditSpent';
      case 9: return 'System';
      case 10: return 'MatchFound';
      case 11: return 'GroupEvent';
      case 12: return 'Referral';
      case 13: return 'ConnectionRequest';
      case 14: return 'ConnectionAccepted';
      case 15: return 'SessionCancelled';
      case 16: return 'SessionRescheduled';
      default: return 'System';
    }
  };

  const getNotificationIcon = (type: number) => {
    const typeString = getNotificationTypeString(type);
    switch (typeString) {
      case 'SessionRequest':
      case 'SessionConfirmed':
      case 'SessionCancelled':
      case 'SessionReminder':
      case 'SessionCompleted':
      case 'SessionRescheduled':
        return Calendar;
      case 'Message':
        return MessageCircle;
      case 'Review':
        return Star;
      case 'CreditEarned':
      case 'CreditSpent':
        return Star;
      case 'System':
        return Info;
      case 'MatchFound':
      case 'GroupEvent':
        return User;
      case 'ConnectionRequest':
      case 'ConnectionAccepted':
        return User;
      case 'Referral':
        return User;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: number) => {
    const typeString = getNotificationTypeString(type);
    switch (typeString) {
      case 'SessionRequest':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'SessionConfirmed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'SessionCancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'SessionReminder':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'SessionCompleted':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'SessionRescheduled':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'Message':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'Review':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'CreditEarned':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'CreditSpent':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'System':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'ConnectionRequest':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'ConnectionAccepted':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'MatchFound':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'GroupEvent':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (date: string) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationTypeLabel = (type: number) => {
    const typeString = getNotificationTypeString(type);
    switch (typeString) {
      case 'SessionRequest': return 'Session Request';
      case 'SessionConfirmed': return 'Session Confirmed';
      case 'SessionCancelled': return 'Session Cancelled';
      case 'SessionReminder': return 'Session Reminder';
      case 'SessionCompleted': return 'Session Completed';
      case 'Message': return 'Message';
      case 'Review': return 'Review';
      case 'CreditEarned': return 'Credits Earned';
      case 'CreditSpent': return 'Credits Spent';
      case 'System': return 'System';
      case 'MatchFound': return 'Match Found';
      case 'GroupEvent': return 'Group Event';
      default: return 'Notification';
    }
  };

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notifications Button */}
      <button 
        onClick={handleToggleExpanded}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell size={20} />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    navigate('/notifications');
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  title="View all notifications"
                >
                  <MoreHorizontal size={16} />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        if (notification.actionUrl) {
                          navigate(notification.actionUrl);
                          setIsExpanded(false);
                        }
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`${colorClass} p-2 rounded-lg flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(notification.createdAt)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {getNotificationTypeLabel(notification.type)}
                                </span>
                                {!notification.isRead && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  navigate('/notifications');
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default NotificationsNav;
