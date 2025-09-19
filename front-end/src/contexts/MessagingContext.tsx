import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { signalRService, SignalRMessage, SignalRConversation, OnlineUser } from '../services/signalRService';
import { messagesService, Message, Conversation } from '../services/messagesService';
import { onlineUsersService } from '../services/onlineUsersService';

interface MessagingContextType {
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  
  // Data state
  conversations: Conversation[];
  unreadCount: number;
  onlineUsers: OnlineUser[];
  
  // Actions
  sendMessage: (receiverId: string, content: string, type?: number, sessionId?: number) => Promise<Message>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  getUnreadCount: () => Promise<number>;
  reconnectSignalR: () => Promise<void>;
  refreshOnlineUsers: () => Promise<void>;
  
  // Real-time event handlers
  onMessageReceived: (callback: (message: Message) => void) => void;
  onConversationUpdated: (callback: (conversation: Conversation) => void) => void;
  onUnreadCountChanged: (callback: (count: number) => void) => void;
  onUserOnline: (callback: (user: OnlineUser) => void) => void;
  onUserOffline: (callback: (user: OnlineUser) => void) => void;
  onOnlineUsersChanged: (callback: (users: OnlineUser[]) => void) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  // Event handler callbacks - using refs to avoid stale closures
  const messageReceivedCallbacks = useRef<((message: Message) => void)[]>([]);
  const conversationUpdatedCallbacks = useRef<((conversation: Conversation) => void)[]>([]);
  const unreadCountChangedCallbacks = useRef<((count: number) => void)[]>([]);
  const userOnlineCallbacks = useRef<((user: OnlineUser) => void)[]>([]);
  const userOfflineCallbacks = useRef<((user: OnlineUser) => void)[]>([]);
  const onlineUsersChangedCallbacks = useRef<((users: OnlineUser[]) => void)[]>([]);

  // Initialize SignalR connection
  useEffect(() => {
    if (!user) {
      return;
    }

    const initializeMessaging = async () => {
      try {
        setConnectionStatus('connecting');
        await signalRService.connect();
        setIsConnected(true);
        setConnectionStatus('connected');

        // Set up SignalR event handlers
        signalRService.onMessageReceivedHandler((message: SignalRMessage) => {
          const convertedMessage: Message = {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            sentAt: message.sentAt,
            readAt: message.readAt,
            isRead: message.isRead,
            sessionId: message.sessionId,
            type: message.type,
            attachmentUrl: message.attachmentUrl,
            sender: message.sender,
            receiver: message.receiver
          };

          // Notify all registered callbacks
          messageReceivedCallbacks.current.forEach(callback => callback(convertedMessage));

          // Update unread count if message is for current user
          if (message.receiverId === user.id && !message.isRead) {
            setUnreadCount(prev => {
              const newCount = prev + 1;
              unreadCountChangedCallbacks.current.forEach(callback => callback(newCount));
              return newCount;
            });
          }
        });

        signalRService.onConversationUpdatedHandler((conversation: SignalRConversation) => {
          const convertedConversation: Conversation = {
            otherUserId: conversation.otherUserId,
            otherUserName: conversation.otherUserName,
            otherUserProfileImage: conversation.otherUserProfileImage,
            lastMessage: conversation.lastMessage,
            lastMessageTime: conversation.lastMessageTime,
            unreadCount: conversation.unreadCount
          };

          setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.otherUserId === conversation.otherUserId);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = convertedConversation;
              return updated.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
            } else {
              return [convertedConversation, ...prev].sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
            }
          });

          // Notify all registered callbacks
          conversationUpdatedCallbacks.current.forEach(callback => callback(convertedConversation));
        });

        signalRService.onConnectionStatusChangedHandler((connected: boolean) => {
          setIsConnected(connected);
          setConnectionStatus(connected ? 'connected' : 'disconnected');
        });

        // Set up online users event handlers
        signalRService.onUserOnlineHandler((user: OnlineUser) => {
          setOnlineUsers(prev => {
            const exists = prev.find(u => u.userId === user.userId);
            if (!exists) {
              const updated = [...prev, user];
              onlineUsersChangedCallbacks.current.forEach(callback => callback(updated));
              return updated;
            }
            return prev;
          });
          userOnlineCallbacks.current.forEach(callback => callback(user));
        });

        signalRService.onUserOfflineHandler((user: OnlineUser) => {
          setOnlineUsers(prev => {
            const updated = prev.filter(u => u.userId !== user.userId);
            onlineUsersChangedCallbacks.current.forEach(callback => callback(updated));
            return updated;
          });
          userOfflineCallbacks.current.forEach(callback => callback(user));
        });

        signalRService.onOnlineUsersListHandler((users: OnlineUser[]) => {
          setOnlineUsers(users);
          onlineUsersChangedCallbacks.current.forEach(callback => callback(users));
        });

        // Load initial data
        await refreshConversations();
        await getUnreadCount();
        await refreshOnlineUsers();
        
        // Request online users list from SignalR
        await signalRService.getOnlineUsers();

      } catch (error) {
        console.error('Error initializing messaging:', error);
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    };

    initializeMessaging();

    // Cleanup on unmount
    return () => {
      signalRService.disconnect();
    };
  }, [user]); // Removed callback arrays from dependencies to prevent infinite loops

  const sendMessage = async (receiverId: string, content: string, type: number = 1, sessionId?: number): Promise<Message> => {
    try {
      const message = await messagesService.sendMessage({
        receiverId,
        content,
        type,
        sessionId
      });
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (senderId: string): Promise<void> => {
    try {
      await messagesService.markMessagesAsRead({ senderId });
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.otherUserId === senderId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
      // Recalculate unread count
      await getUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  const refreshConversations = async (): Promise<void> => {
    try {
      const conversationsData = await messagesService.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      throw error;
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    try {
      const response = await messagesService.getUnreadCount();
      setUnreadCount(response.unreadCount);
      unreadCountChangedCallbacks.current.forEach(callback => callback(response.unreadCount));
      return response.unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  };

  const refreshOnlineUsers = async (): Promise<void> => {
    try {
      const response = await onlineUsersService.getOnlineUsers();
      setOnlineUsers(response.onlineUsers);
      onlineUsersChangedCallbacks.current.forEach(callback => callback(response.onlineUsers));
    } catch (error) {
      console.error('Error refreshing online users:', error);
      throw error;
    }
  };

  const onMessageReceived = (callback: (message: Message) => void) => {
    messageReceivedCallbacks.current.push(callback);
    return () => {
      const index = messageReceivedCallbacks.current.indexOf(callback);
      if (index > -1) {
        messageReceivedCallbacks.current.splice(index, 1);
      }
    };
  };

  const onConversationUpdated = (callback: (conversation: Conversation) => void) => {
    conversationUpdatedCallbacks.current.push(callback);
    return () => {
      const index = conversationUpdatedCallbacks.current.indexOf(callback);
      if (index > -1) {
        conversationUpdatedCallbacks.current.splice(index, 1);
      }
    };
  };

  const onUnreadCountChanged = (callback: (count: number) => void) => {
    unreadCountChangedCallbacks.current.push(callback);
    return () => {
      const index = unreadCountChangedCallbacks.current.indexOf(callback);
      if (index > -1) {
        unreadCountChangedCallbacks.current.splice(index, 1);
      }
    };
  };

  const onUserOnline = (callback: (user: OnlineUser) => void) => {
    userOnlineCallbacks.current.push(callback);
    return () => {
      const index = userOnlineCallbacks.current.indexOf(callback);
      if (index > -1) {
        userOnlineCallbacks.current.splice(index, 1);
      }
    };
  };

  const onUserOffline = (callback: (user: OnlineUser) => void) => {
    userOfflineCallbacks.current.push(callback);
    return () => {
      const index = userOfflineCallbacks.current.indexOf(callback);
      if (index > -1) {
        userOfflineCallbacks.current.splice(index, 1);
      }
    };
  };

  const onOnlineUsersChanged = (callback: (users: OnlineUser[]) => void) => {
    onlineUsersChangedCallbacks.current.push(callback);
    return () => {
      const index = onlineUsersChangedCallbacks.current.indexOf(callback);
      if (index > -1) {
        onlineUsersChangedCallbacks.current.splice(index, 1);
      }
    };
  };

  // Method to manually reconnect SignalR (useful after login)
  const reconnectSignalR = async () => {
    if (!user) return;
    
    try {
      setConnectionStatus('connecting');
      await signalRService.connect();
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Reload data after reconnection
      await refreshConversations();
      await getUnreadCount();
      await refreshOnlineUsers();
      await signalRService.getOnlineUsers();
    } catch (error) {
      console.error('Failed to reconnect SignalR:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  };

  const value: MessagingContextType = {
    isConnected,
    connectionStatus,
    conversations,
    unreadCount,
    onlineUsers,
    sendMessage,
    markMessagesAsRead,
    refreshConversations,
    getUnreadCount,
    reconnectSignalR,
    refreshOnlineUsers,
    onMessageReceived,
    onConversationUpdated,
    onUnreadCountChanged,
    onUserOnline,
    onUserOffline,
    onOnlineUsersChanged
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
