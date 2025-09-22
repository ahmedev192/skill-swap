import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Info, 
  Star,
  Calendar,
  MessageCircle,
  User,
  Loader2,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { notificationsService, Notification } from '../../services/notificationsService';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { onUnreadCountsUpdated } = useMessaging();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper functions
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
        return 'text-blue-600 dark:text-blue-400';
      case 'SessionConfirmed':
        return 'text-green-600 dark:text-green-400';
      case 'SessionCancelled':
        return 'text-red-600 dark:text-red-400';
      case 'SessionReminder':
        return 'text-orange-600 dark:text-orange-400';
      case 'SessionCompleted':
        return 'text-green-600 dark:text-green-400';
      case 'SessionRescheduled':
        return 'text-orange-600 dark:text-orange-400';
      case 'Message':
        return 'text-purple-600 dark:text-purple-400';
      case 'Review':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'CreditEarned':
        return 'text-green-600 dark:text-green-400';
      case 'CreditSpent':
        return 'text-red-600 dark:text-red-400';
      case 'System':
        return 'text-gray-600 dark:text-gray-400';
      case 'ConnectionRequest':
        return 'text-blue-600 dark:text-blue-400';
      case 'ConnectionAccepted':
        return 'text-green-600 dark:text-green-400';
      case 'MatchFound':
        return 'text-blue-600 dark:text-blue-400';
      case 'GroupEvent':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const userNotifications = await notificationsService.getNotifications();
        setNotifications(userNotifications);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error loading notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const filteredNotifications = notifications.filter(notification => {
    const typeString = getNotificationTypeString(notification.type);
    const matchesType = filterType === 'all' || typeString === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead);
    const matchesSearch = searchTerm === '' || 
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      // The counter will be updated automatically via SignalR
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read. Please try again.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      // The counter will be updated automatically via SignalR
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark all notifications as read. Please try again.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with your activity and messages
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by type:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Types', color: 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' },
              { value: 'SessionRequest', label: 'Session Requests', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
              { value: 'SessionConfirmed', label: 'Confirmations', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
              { value: 'SessionReminder', label: 'Reminders', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' },
              { value: 'SessionCompleted', label: 'Completed', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
              { value: 'SessionCancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
              { value: 'SessionRescheduled', label: 'Rescheduled', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' },
              { value: 'Message', label: 'Messages', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' },
              { value: 'Review', label: 'Reviews', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' },
              { value: 'CreditEarned', label: 'Credits Earned', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
              { value: 'CreditSpent', label: 'Credits Spent', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
              { value: 'ConnectionRequest', label: 'Connection Requests', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
              { value: 'ConnectionAccepted', label: 'Connections', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
              { value: 'MatchFound', label: 'Matches', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
              { value: 'System', label: 'System', color: 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  filterType === filter.value 
                    ? `${filter.color} ring-2 ring-blue-500 dark:ring-blue-400` 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Status', color: 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' },
              { value: 'unread', label: 'Unread', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
              { value: 'read', label: 'Read', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  filterStatus === filter.value 
                    ? `${filter.color} ring-2 ring-blue-500 dark:ring-blue-400` 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                  !notification.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => {
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${colorClass} p-3 rounded-xl flex-shrink-0 shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            <span className="capitalize">{getNotificationTypeString(notification.type).replace(/([A-Z])/g, ' $1').trim()}</span>
                          </span>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No notifications found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters to see more notifications'
                : 'You\'re all caught up! No new notifications.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
