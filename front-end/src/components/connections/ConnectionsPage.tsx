import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  MoreHorizontal,
  UserMinus,
  Shield,
  Search,
  Filter,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { useConnection } from '../../contexts/ConnectionContext';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorContext } from '../../contexts/ErrorContext';
import { connectionService } from '../../services/connectionService';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import ConnectionButton from './ConnectionButton';

const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleError } = useErrorContext();
  const { 
    connections, 
    pendingRequests, 
    sentRequests, 
    connectionStats,
    isLoading,
    respondToConnectionRequest,
    removeConnection,
    blockUser,
    refreshConnections,
    refreshPendingRequests,
    refreshSentRequests
  } = useConnection();
  
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'sent'>('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      if (activeTab !== 'connections') {
        // For pending and sent requests, use client-side filtering
        return;
      }

      try {
        setIsSearching(true);
        const results = await connectionService.searchConnections(debouncedSearchTerm);
        setSearchResults(results);
      } catch (error) {
        handleError(error, 'search connections');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, activeTab, handleError]);

  // Memoize the data loading function to prevent infinite loops
  const loadInitialData = useCallback(async () => {
    if (user) {
      try {
        await Promise.all([
          refreshConnections(),
          refreshPendingRequests(),
          refreshSentRequests()
        ]);
      } catch (error) {
        handleError(error, 'load initial connection data');
      }
    }
  }, [user, refreshConnections, refreshPendingRequests, refreshSentRequests, handleError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleAcceptRequest = async (connectionId: number) => {
    try {
      setIsResponding(true);
      await respondToConnectionRequest({
        connectionId,
        status: 2 // Accepted
      });
    } catch (error) {
      handleError(error, 'accept connection request');
    } finally {
      setIsResponding(false);
    }
  };

  const handleDeclineRequest = async (connectionId: number) => {
    try {
      setIsResponding(true);
      await respondToConnectionRequest({
        connectionId,
        status: 3 // Declined
      });
    } catch (error) {
      handleError(error, 'decline connection request');
    } finally {
      setIsResponding(false);
    }
  };

  const handleRemoveConnection = async (connectionId: number) => {
    if (confirm('Are you sure you want to remove this connection?')) {
      try {
        await removeConnection(connectionId);
      } catch (error) {
        handleError(error, 'remove connection');
      }
    }
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to block ${userName}?`)) {
      try {
        await blockUser(userId);
      } catch (error) {
        handleError(error, 'block user');
      }
    }
  };

  const handleStartChat = (userId: string, userName: string) => {
    // Navigate to chat page with the user ID as a parameter
    navigate('/chat');
    // Store the user info in sessionStorage for the chat page to pick up
    sessionStorage.setItem('chatUser', JSON.stringify({ userId, userName }));
  };

  const getFilteredConnections = useCallback(() => {
    if (activeTab === 'connections') {
      // For connections tab, use server-side search results if searching
      if (debouncedSearchTerm.trim()) {
        return searchResults; // This will be empty array if no results found
      }
      return connections;
    } else if (activeTab === 'pending') {
      // For pending requests, use client-side filtering
      if (!debouncedSearchTerm.trim()) {
        return pendingRequests;
      }
      return pendingRequests.filter(conn => {
        const otherUser = conn.requesterId === user?.id ? conn.receiver : conn.requester;
        if (!otherUser) return false;
        
        const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
        const email = otherUser.email?.toLowerCase() || '';
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    } else if (activeTab === 'sent') {
      // For sent requests, use client-side filtering
      if (!debouncedSearchTerm.trim()) {
        return sentRequests;
      }
      return sentRequests.filter(conn => {
        const otherUser = conn.requesterId === user?.id ? conn.receiver : conn.requester;
        if (!otherUser) return false;
        
        const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
        const email = otherUser.email?.toLowerCase() || '';
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }
    
    return [];
  }, [activeTab, connections, pendingRequests, sentRequests, user?.id, debouncedSearchTerm, searchResults]);

  const renderUserCard = (connection: any, type: 'connection' | 'pending' | 'sent') => {
    const otherUser = connection.requesterId === user?.id ? connection.receiver : connection.requester;
    if (!otherUser) return null;

    return (
      <div key={connection.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {getUserAvatarUrl(otherUser) ? (
                <img
                  src={getUserAvatarUrl(otherUser)!}
                  alt={`${otherUser.firstName} ${otherUser.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <Users className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {otherUser.email}
              </p>
              {otherUser.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {otherUser.bio}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Connected: {new Date(connection.createdAt).toLocaleDateString()}</span>
                {connection.respondedAt && (
                  <span>Responded: {new Date(connection.respondedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {type === 'pending' && (
              <>
                <button
                  onClick={() => handleAcceptRequest(connection.id)}
                  disabled={isResponding}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 transition-colors"
                  title="Accept Request"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeclineRequest(connection.id)}
                  disabled={isResponding}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                  title="Decline Request"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
            
            {type === 'connection' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStartChat(otherUser.id, `${otherUser.firstName} ${otherUser.lastName}`)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                  title="Start Chat"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveConnection(connection.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Remove Connection"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleBlockUser(otherUser.id, `${otherUser.firstName} ${otherUser.lastName}`)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Block User"
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {type === 'sent' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </span>
            )}
          </div>
        </div>
        
        {connection.message && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              "{connection.message}"
            </p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Connections
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your professional connections and network
        </p>
      </div>

      {/* Stats */}
      {connectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Connections</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {connectionStats.totalConnections}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {connectionStats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent Requests</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {connectionStats.pendingSent}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'connections', name: 'Connections', count: connections.length },
              { id: 'pending', name: 'Pending Requests', count: pendingRequests.length },
              { id: 'sent', name: 'Sent Requests', count: sentRequests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.name}</span>
                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'connections' && (
          <>
            {isSearching ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Searching connections...</p>
              </div>
            ) : getFilteredConnections().length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {debouncedSearchTerm.trim() ? 'No connections found' : 'No connections yet'}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {debouncedSearchTerm.trim() 
                    ? `No connections match "${debouncedSearchTerm}"`
                    : 'Start connecting with other users to build your network'
                  }
                </p>
              </div>
            ) : (
              getFilteredConnections().map(connection => renderUserCard(connection, 'connection'))
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <>
            {getFilteredConnections().length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {debouncedSearchTerm.trim() ? 'No pending requests found' : 'No pending requests'}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {debouncedSearchTerm.trim() 
                    ? `No pending requests match "${debouncedSearchTerm}"`
                    : 'You don\'t have any pending connection requests'
                  }
                </p>
              </div>
            ) : (
              getFilteredConnections().map(request => renderUserCard(request, 'pending'))
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {getFilteredConnections().length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {debouncedSearchTerm.trim() ? 'No sent requests found' : 'No sent requests'}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {debouncedSearchTerm.trim() 
                    ? `No sent requests match "${debouncedSearchTerm}"`
                    : 'You haven\'t sent any connection requests yet'
                  }
                </p>
              </div>
            ) : (
              getFilteredConnections().map(request => renderUserCard(request, 'sent'))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
