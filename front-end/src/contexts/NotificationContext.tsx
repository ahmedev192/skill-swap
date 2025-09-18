import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Notification, Message } from '../types';
import { useAuth } from './AuthContext';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connection: HubConnection | null;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize SignalR connection
      const newConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:51422/notificationHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event listeners
      newConnection.on('ReceiveNotification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success(notification.title);
      });

      newConnection.on('ReceiveMessage', (message: Message) => {
        toast.success(`New message from ${message.sender.firstName}`);
      });

      newConnection.on('SessionUpdate', (session: any) => {
        toast.info(`Session updated: ${session.status}`);
      });

      // Start connection
      newConnection.start()
        .then(() => {
          console.log('SignalR Connected');
          setConnection(newConnection);
        })
        .catch(err => console.log('SignalR Connection Error: ', err));

      // Load initial notifications
      loadNotifications();
      loadUnreadCount();

      return () => {
        newConnection.stop();
      };
    }
  }, [isAuthenticated, token]);

  const loadNotifications = async () => {
    try {
      const notifications = await apiClient.getNotifications();
      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { unreadCount } = await apiClient.getUnreadNotificationCount();
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    connection,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};