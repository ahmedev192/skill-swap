import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useErrorContext } from './ErrorContext';
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
  const { handleError } = useErrorContext();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserConnection[]>([]);
  const [sentRequests, setSentRequests] = useState<UserConnection[]>([]);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Define refresh functions first
  const refreshConnections = useCallback(async (): Promise<void> => {
    try {
      const data = await connectionService.getConnections();
      setConnections(data);
    } catch (error) {
      handleError(error, 'refresh connections');
    }
  }, [handleError]);

  const refreshPendingRequests = useCallback(async (): Promise<void> => {
    try {
      const data = await connectionService.getConnectionRequests();
      setPendingRequests(data);
    } catch (error) {
      handleError(error, 'refresh pending requests');
    }
  }, [handleError]);

  const refreshSentRequests = useCallback(async (): Promise<void> => {
    try {
      const data = await connectionService.getSentConnectionRequests();
      setSentRequests(data);
    } catch (error) {
      handleError(error, 'refresh sent requests');
    }
  }, [handleError]);

  const refreshConnectionStats = useCallback(async (): Promise<void> => {
    try {
      const data = await connectionService.getConnectionStats();
      setConnectionStats(data);
    } catch (error) {
      handleError(error, 'refresh connection stats');
    }
  }, [handleError]);

  // Define loadConnectionData after refresh functions
  const loadConnectionData = useCallback(async () => {
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
      handleError(error, 'load connection data');
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshConnections, refreshPendingRequests, refreshSentRequests, refreshConnectionStats, handleError]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadConnectionData();
    }
  }, [user, loadConnectionData]);

  const sendConnectionRequest = useCallback(async (request: CreateConnectionRequest): Promise<UserConnection> => {
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
  }, [connectionStats]);

  const respondToConnectionRequest = useCallback(async (response: RespondToConnection): Promise<UserConnection> => {
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
  }, [connectionStats]);

  const removeConnection = useCallback(async (connectionId: number): Promise<void> => {
    try {
      await connectionService.removeConnection(connectionId);
      
      // Remove from connections
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      // Update stats
      if (connectionStats) {
        setConnectionStats(prev => prev ? { ...prev, totalConnections: prev.totalConnections - 1 } : null);
      }
    } catch (error) {
      handleError(error, 'remove connection');
      throw error;
    }
  }, [connectionStats, handleError]);

  const blockUser = useCallback(async (targetUserId: string): Promise<void> => {
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
      handleError(error, 'block user');
      throw error;
    }
  }, [refreshConnectionStats, handleError]);

  const unblockUser = useCallback(async (targetUserId: string): Promise<void> => {
    try {
      await connectionService.unblockUser(targetUserId);
      // Refresh stats
      await refreshConnectionStats();
    } catch (error) {
      handleError(error, 'unblock user');
      throw error;
    }
  }, [refreshConnectionStats, handleError]);

  const isConnected = useCallback((userId: string): boolean => {
    return connections.some(conn => 
      (conn.requesterId === userId && conn.receiverId === user?.id) ||
      (conn.requesterId === user?.id && conn.receiverId === userId)
    );
  }, [connections, user?.id]);

  const hasPendingRequest = useCallback((userId: string): boolean => {
    return pendingRequests.some(req => req.requesterId === userId) ||
           sentRequests.some(req => req.receiverId === userId);
  }, [pendingRequests, sentRequests]);

  const getConnectionStatus = useCallback((userId: string): 'connected' | 'pending' | 'sent' | 'none' => {
    if (isConnected(userId)) return 'connected';
    if (pendingRequests.some(req => req.requesterId === userId)) return 'pending';
    if (sentRequests.some(req => req.receiverId === userId)) return 'sent';
    return 'none';
  }, [isConnected, pendingRequests, sentRequests]);

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
