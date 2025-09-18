import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Calendar, MessageSquare, Star, Award, Users } from 'lucide-react';
import { Notification, NotificationType } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SessionRequest:
      case NotificationType.SessionConfirmed:
      case NotificationType.SessionReminder:
      case NotificationType.SessionCompleted:
        return Calendar;
      case NotificationType.NewMessage:
        return MessageSquare;
      case NotificationType.NewReview:
        return Star;
      case NotificationType.CreditEarned:
      case NotificationType.CreditSpent:
        return Award;
      case NotificationType.MatchFound:
        return Users;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SessionRequest:
      case NotificationType.SessionConfirmed:
      case NotificationType.SessionReminder:
      case NotificationType.SessionCompleted:
        return 'from-blue-500 to-blue-600';
      case NotificationType.NewMessage:
        return 'from-green-500 to-green-600';
      case NotificationType.NewReview:
        return 'from-yellow-500 to-yellow-600';
      case NotificationType.CreditEarned:
      case NotificationType.CreditSpent:
        return 'from-purple-500 to-purple-600';
      case NotificationType.MatchFound:
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatNotificationTime = (date: string) => {
    const notificationDate = new Date(date);
    if (isToday(notificationDate)) {
      return format(notificationDate, 'h:mm a');
    } else if (isYesterday(notificationDate)) {
      return 'Yesterday';
    } else {
      return format(notificationDate, 'MMM dd');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    let key: string;
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else {
      key = format(date, 'MMMM dd, yyyy');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const notificationTypes = [
    { value: 'all' as const, label: 'All Types' },
    { value: NotificationType.SessionRequest, label: 'Session Requests' },
    { value: NotificationType.NewMessage, label: 'Messages' },
    { value: NotificationType.NewReview, label: 'Reviews' },
    { value: NotificationType.CreditEarned, label: 'Credits' },
    { value: NotificationType.MatchFound, label: 'Matches' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-blue-100">
                Stay updated with your latest activities
              </p>
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filters
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as NotificationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {Object.keys(groupedNotifications).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{date}</h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {dayNotifications.map((notification, index) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all duration-200 ${
                            !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatNotificationTime(notification.createdAt)}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  {!notification.isRead && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                      title="Mark as read"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {notification.actionUrl && (
                                <div className="mt-3">
                                  <a
                                    href={notification.actionUrl}
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    View Details →
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications at the moment."
                : "You don't have any notifications yet. They'll appear here when you do."
              }
            </p>
            {filter === 'unread' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;