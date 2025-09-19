import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { connectionService, UserConnection, ConnectionStats, CreateConnectionRequest, RespondToConnection } from '../services/connectionService';

interface ConnectionContextType {
  // Data state
  connections: UserConnection[];
  pendingRequests: UserConnection[];
  sentRequests: UserConnection[];
  connectionStats: ConnectionStats | null;
  
  // Loading states
  isLoading: boolean;
  isSendingRequest: boolean;
  isResponding: boolean;
  
  // Actions
  sendConnectionRequest: (request: CreateConnectionRequest) => Promise<UserConnection>;
  respondToConnectionRequest: (response: RespondToConnection) => Promise<UserConnection>;
  removeConnection: (connectionId: number) => Promise<void>;
  blockUser: (targetUserId: string) => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<void>;
  refreshConnections: () => Promise<void>;
  refreshPendingRequests: () => Promise<void>;
  refreshSentRequests: () => Promise<void>;
  refreshConnectionStats: () => Promise<void>;
  
  // Helper functions
  isConnected: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  getConnectionStatus: (userId: string) => 'connected' | 'pending' | 'sent' | 'none';
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserConnection[]>([]);
  const [sentRequests, setSentRequests] = useState<UserConnection[]>([]);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadConnectionData();
    }
  }, [user]);

  const loadConnectionData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await Promise.all([
        refreshConnections(),
        refreshPendingRequests(),
        refreshSentRequests(),
        refreshConnectionStats()
      ]);
    } catch (error) {
      console.error('Error loading connection data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (request: CreateConnectionRequest): Promise<UserConnection> => {
    try {
      setIsSendingRequest(true);
      const newConnection = await connectionService.sendConnectionRequest(request);
      
      // Add to sent requests
      setSentRequests(prev => [newConnection, ...prev]);
      
      // Update stats
      if (connectionStats) {
        setConnectionStats(prev => prev ? { ...prev, pendingSent: prev.pendingSent + 1 } : null);
      }
      
      return newConnection;
    } finally {
      setIsSendingRequest(false);
    }
  };

  const respondToConnectionRequest = async (response: RespondToConnection): Promise<UserConnection> => {
    try {
      setIsResponding(true);
      const updatedConnection = await connectionService.respondToConnectionRequest(response);
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== response.connectionId));
      
      // If accepted, add to connections
      if (response.status === 2) { // Accepted
        setConnections(prev => [updatedConnection, ...prev]);
      }
      
      // Update stats
      if (connectionStats) {
        setConnectionStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pendingRequests: prev.pendingRequests - 1,
            totalConnections: response.status === 2 ? prev.totalConnections + 1 : prev.totalConnections
          };
        });
      }
      
      return updatedConnection;
    } finally {
      setIsResponding(false);
    }
  };

  const removeConnection = async (connectionId: number): Promise<void> => {
    try {
      await connectionService.removeConnection(connectionId);
      
      // Remove from connections
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      // Update stats
      if (connectionStats) {
        setConnectionStats(prev => prev ? { ...prev, totalConnections: prev.totalConnections - 1 } : null);
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  };

  const blockUser = async (targetUserId: string): Promise<void> => {
    try {
      await connectionService.blockUser(targetUserId);
      
      // Remove any existing connections/requests with this user
      setConnections(prev => prev.filter(conn => 
        conn.requesterId !== targetUserId && conn.receiverId !== targetUserId));
      setPendingRequests(prev => prev.filter(req => 
        req.requesterId !== targetUserId && req.receiverId !== targetUserId));
      setSentRequests(prev => prev.filter(req => 
        req.requesterId !== targetUserId && req.receiverId !== targetUserId));
      
      // Refresh stats
      await refreshConnectionStats();
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (targetUserId: string): Promise<void> => {
    try {
      await connectionService.unblockUser(targetUserId);
      // Refresh stats
      await refreshConnectionStats();
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const refreshConnections = async (): Promise<void> => {
    try {
      const data = await connectionService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error refreshing connections:', error);
    }
  };

  const refreshPendingRequests = async (): Promise<void> => {
    try {
      const data = await connectionService.getConnectionRequests();
      setPendingRequests(data);
    } catch (error) {
      console.error('Error refreshing pending requests:', error);
    }
  };

  const refreshSentRequests = async (): Promise<void> => {
    try {
      const data = await connectionService.getSentConnectionRequests();
      setSentRequests(data);
    } catch (error) {
      console.error('Error refreshing sent requests:', error);
    }
  };

  const refreshConnectionStats = async (): Promise<void> => {
    try {
      const data = await connectionService.getConnectionStats();
      setConnectionStats(data);
    } catch (error) {
      console.error('Error refreshing connection stats:', error);
    }
  };

  const isConnected = (userId: string): boolean => {
    return connections.some(conn => 
      (conn.requesterId === userId && conn.receiverId === user?.id) ||
      (conn.requesterId === user?.id && conn.receiverId === userId)
    );
  };

  const hasPendingRequest = (userId: string): boolean => {
    return pendingRequests.some(req => req.requesterId === userId) ||
           sentRequests.some(req => req.receiverId === userId);
  };

  const getConnectionStatus = (userId: string): 'connected' | 'pending' | 'sent' | 'none' => {
    if (isConnected(userId)) return 'connected';
    if (pendingRequests.some(req => req.requesterId === userId)) return 'pending';
    if (sentRequests.some(req => req.receiverId === userId)) return 'sent';
    return 'none';
  };

  const value: ConnectionContextType = {
    connections,
    pendingRequests,
    sentRequests,
    connectionStats,
    isLoading,
    isSendingRequest,
    isResponding,
    sendConnectionRequest,
    respondToConnectionRequest,
    removeConnection,
    blockUser,
    unblockUser,
    refreshConnections,
    refreshPendingRequests,
    refreshSentRequests,
    refreshConnectionStats,
    isConnected,
    hasPendingRequest,
    getConnectionStatus
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
