import * as signalR from '@microsoft/signalr';
import { getSignalRUrl } from '../config/api';

export interface SignalRMessage {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  sessionId?: number;
  type: number;
  attachmentUrl?: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

export interface SignalRConversation {
  otherUserId: string;
  otherUserName: string;
  otherUserProfileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface OnlineUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  connectedAt: string;
  lastSeen: string;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event handlers
  private onMessageReceived: ((message: SignalRMessage) => void) | null = null;
  private onConversationUpdated: ((conversation: SignalRConversation) => void) | null = null;
  private onMessageRead: ((messageId: number, readAt: string) => void) | null = null;
  private onConnectionStatusChanged: ((isConnected: boolean) => void) | null = null;
  private onUserOnline: ((user: OnlineUser) => void) | null = null;
  private onUserOffline: ((user: OnlineUser) => void) | null = null;
  private onOnlineUsersList: ((users: OnlineUser[]) => void) | null = null;
  private onUnreadCountUpdated: ((unreadMessageCount: number, unreadNotificationCount: number) => void) | null = null;

  constructor() {
    this.setupConnection();
  }

  private setupConnection() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Clean up existing connection if it exists
    if (this.connection) {
      this.connection = null;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(getSignalRUrl(), {
          accessTokenFactory: () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
              throw new Error('No authentication token available');
            }
            return currentToken;
          },
          // Use WebSockets primarily, fall back to ServerSentEvents, then LongPolling
          transport: signalR.HttpTransportType.WebSockets | 
                    signalR.HttpTransportType.ServerSentEvents | 
                    signalR.HttpTransportType.LongPolling,
          // Add connection options for better stability and CSP compatibility
          skipNegotiation: false,
          withCredentials: false,
          // Add headers for better compatibility
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // Custom retry logic: 0, 2s, 5s, 10s, 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 5000;
            if (retryContext.previousRetryCount === 3) return 10000;
            return 30000;
          }
        })
        .configureLogging(signalR.LogLevel.Warning) // Reduce log noise
        .build();

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to setup SignalR connection:', error);
      this.connection = null;
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Message received event
    this.connection.on('MessageReceived', (message: SignalRMessage) => {
      if (this.onMessageReceived) {
        this.onMessageReceived(message);
      }
    });

    // Conversation updated event
    this.connection.on('ConversationUpdated', (conversation: SignalRConversation) => {
      if (this.onConversationUpdated) {
        this.onConversationUpdated(conversation);
      }
    });

    // Message read event
    this.connection.on('MessageRead', (messageId: number, readAt: string) => {
      if (this.onMessageRead) {
        this.onMessageRead(messageId, readAt);
      }
    });

    // User online event
    this.connection.on('UserOnline', (user: OnlineUser) => {
      if (this.onUserOnline) {
        this.onUserOnline(user);
      }
    });

    // User offline event
    this.connection.on('UserOffline', (user: OnlineUser) => {
      if (this.onUserOffline) {
        this.onUserOffline(user);
      }
    });

    // Online users list event
    this.connection.on('OnlineUsersList', (users: OnlineUser[]) => {
      if (this.onOnlineUsersList) {
        this.onOnlineUsersList(users);
      }
    });

    // Unread count updated event
    this.connection.on('UnreadCountUpdated', (data: { unreadMessageCount: number, unreadNotificationCount: number }) => {
      if (this.onUnreadCountUpdated) {
        this.onUnreadCountUpdated(data.unreadMessageCount, data.unreadNotificationCount);
      }
    });

    // Connection events
    this.connection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed with error:', error);
      }
      this.isConnected = false;
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false);
      }
      // Only attempt manual reconnect if automatic reconnect fails
      if (error) {
        this.attemptReconnect();
      }
    });

    this.connection.onreconnecting((error) => {
      this.isConnected = false;
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false);
      }
    });

    this.connection.onreconnected((connectionId) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(true);
      }
    });
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  async connect(): Promise<void> {
    // Check if already connected
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Check if connection is in progress
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    // Check token validity
    if (!this.isTokenValid()) {
      throw new Error('Authentication token is invalid or expired');
    }

    // If connection exists but is not in a valid state, clean it up
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn('Error stopping existing connection:', error);
      }
      this.connection = null;
      this.isConnected = false;
    }

    // Setup connection if not exists
    if (!this.connection) {
      this.setupConnection();
    }

    if (!this.connection) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available for SignalR connection');
      }
      throw new Error('Failed to create SignalR connection');
    }

    // Ensure connection is in disconnected state before starting
    if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
      throw new Error(`Cannot start connection in state: ${this.connection.state}`);
    }

    try {
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(true);
      }
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        // Only stop if not already disconnected
        if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
          await this.connection.stop();
        }
      } catch (error) {
        console.warn('Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
        this.isConnected = false;
        
        if (this.onConnectionStatusChanged) {
          this.onConnectionStatusChanged(false);
        }
      }
    }
  }

  // Event subscription methods
  onMessageReceivedHandler(handler: (message: SignalRMessage) => void) {
    this.onMessageReceived = handler;
  }

  onConversationUpdatedHandler(handler: (conversation: SignalRConversation) => void) {
    this.onConversationUpdated = handler;
  }

  onMessageReadHandler(handler: (messageId: number, readAt: string) => void) {
    this.onMessageRead = handler;
  }

  onConnectionStatusChangedHandler(handler: (isConnected: boolean) => void) {
    this.onConnectionStatusChanged = handler;
  }

  onUserOnlineHandler(handler: (user: OnlineUser) => void) {
    this.onUserOnline = handler;
  }

  onUserOfflineHandler(handler: (user: OnlineUser) => void) {
    this.onUserOffline = handler;
  }

  onOnlineUsersListHandler(handler: (users: OnlineUser[]) => void) {
    this.onOnlineUsersList = handler;
  }

  onUnreadCountUpdatedHandler(handler: (unreadMessageCount: number, unreadNotificationCount: number) => void) {
    this.onUnreadCountUpdated = handler;
  }

  // Utility methods
  isConnectionActive(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  // Refresh connection with new token
  async refreshConnection(): Promise<void> {
    await this.disconnect();
    // Wait a moment to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    this.setupConnection();
    await this.connect();
  }

  // Reset connection state completely
  async resetConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn('Error stopping connection during reset:', error);
      }
    }
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    if (this.onConnectionStatusChanged) {
      this.onConnectionStatusChanged(false);
    }
  }

  // Check if token is valid and refresh if needed
  private isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Add 5 minute buffer to prevent connection issues near expiry
      return payload.exp > (currentTime + 300);
    } catch {
      return false;
    }
  }

  // Get connection health status
  getConnectionHealth(): { isHealthy: boolean; state: string; lastError?: string } {
    if (!this.connection) {
      return { isHealthy: false, state: 'No connection' };
    }

    const state = this.connection.state;
    const isHealthy = state === signalR.HubConnectionState.Connected && this.isConnected;
    
    return {
      isHealthy,
      state: signalR.HubConnectionState[state],
      lastError: !isHealthy ? 'Connection not healthy' : undefined
    };
  }

  // Join conversation group (for targeted messaging)
  async joinConversationGroup(userId: string): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinGroup', `User_${userId}`);
      } catch (error) {
        console.error('Failed to join conversation group:', error);
      }
    }
  }

  // Leave conversation group
  async leaveConversationGroup(userId: string): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveGroup', `User_${userId}`);
      } catch (error) {
        console.error('Failed to leave conversation group:', error);
      }
    }
  }

  // Request online users list
  async getOnlineUsers(): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('GetOnlineUsers');
      } catch (error) {
        console.error('Failed to get online users:', error);
      }
    }
  }

  // Update last seen timestamp
  async updateLastSeen(): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('UpdateLastSeen');
      } catch (error) {
        console.error('Failed to update last seen:', error);
      }
    }
  }
}

export const signalRService = new SignalRService();
