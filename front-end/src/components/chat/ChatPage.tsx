import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Search, 
  User, 
  Phone, 
  Video, 
  MoreHorizontal,
  Paperclip,
  Smile,
  Circle,
  MessageCircle,
  Wifi,
  WifiOff,
  Users,
  Plus,
  X
} from 'lucide-react';
// import { ChatMessage, User as UserType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { messagesService, Conversation, Message } from '../../services/messagesService';
import { signalRService, SignalRMessage, SignalRConversation } from '../../services/signalRService';
import { useConnection } from '../../contexts/ConnectionContext';
import CallModal from './CallModal';
import OnlineUsers from './OnlineUsers';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connections, refreshConnections } = useConnection();
  const { 
    onlineUsers, 
    isConnected, 
    connectionStatus, 
    conversations, 
    sendMessage, 
    markMessagesAsRead,
    refreshConversations,
    onMessageReceived,
    onConversationUpdated
  } = useMessaging();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load connections when component mounts
  useEffect(() => {
    if (user) {
      refreshConnections();
    }
  }, [user, refreshConnections]);

  // Handle sessionStorage for starting a new chat
  useEffect(() => {
    const chatUserData = sessionStorage.getItem('chatUser');
    
    if (chatUserData) {
      try {
        const { userId, userName } = JSON.parse(chatUserData);
        setSelectedChat(userId);
        // Clear the sessionStorage after setting the chat
        sessionStorage.removeItem('chatUser');
      } catch (error) {
        // Invalid chat user data, clear it
        sessionStorage.removeItem('chatUser');
      }
    }
  }, []);

  // Update connections data
  useEffect(() => {
    // Connections data is automatically updated by the context
  }, [connections]);

  // Initialize chat and set up message handlers
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    
    // Set up message received handler
    const unsubscribeMessageReceived = onMessageReceived((message: Message) => {
      if (message.senderId === selectedChat || message.receiverId === selectedChat) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Set up conversation updated handler
    const unsubscribeConversationUpdated = onConversationUpdated((conversation: Conversation) => {
      // Conversations are already managed by MessagingContext
    });

    return () => {
      unsubscribeMessageReceived();
      unsubscribeConversationUpdated();
    };
  }, [user, selectedChat, onMessageReceived, onConversationUpdated]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) {
        console.log('No selectedChat, skipping message load');
        return;
      }
      
      console.log('Loading messages for selectedChat:', selectedChat);
      try {
        const messagesData = await messagesService.getConversation(selectedChat);
        console.log('Loaded messages:', messagesData);
        setMessages(messagesData);
        
        // Mark messages as read when conversation is selected
        await markMessagesAsRead(selectedChat);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedChat, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectedConversation = conversations.find(conv => conv.otherUserId === selectedChat);
  
  // Get user info for selected chat (either from conversation or connections)
  const getSelectedUserInfo = () => {
    if (selectedConversation) {
      return {
        name: selectedConversation.otherUserName,
        lastMessageTime: selectedConversation.lastMessageTime
      };
    }
    
    // If no conversation exists, find user in connections
    if (selectedChat) {
      const connection = connections.find(conn => {
        const otherUser = conn.requesterId === user?.id ? conn.receiver : conn.requester;
        return otherUser?.id === selectedChat;
      });
      
      if (connection) {
        const otherUser = connection.requesterId === user?.id ? connection.receiver : connection.requester;
        return {
          name: `${otherUser?.firstName} ${otherUser?.lastName}`,
          lastMessageTime: null
        };
      }
    }
    
    return null;
  };
  
  const selectedUserInfo = getSelectedUserInfo();
  
  // Debug selectedConversation
  useEffect(() => {
    console.log('selectedChat changed to:', selectedChat);
    console.log('conversations array:', conversations);
    console.log('selectedConversation found:', selectedConversation);
    console.log('selectedUserInfo:', selectedUserInfo);
  }, [selectedChat, conversations, selectedConversation, selectedUserInfo]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChat) {
      try {
        const newMessage = await sendMessage(selectedChat, messageInput.trim(), 1);
        
        // Add the new message to the local state
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        scrollToBottom();
      } catch (error) {
        console.error('Error sending message:', error);
        // Show user-friendly error message
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setShowCallModal(true);
  };

  const handleCloseCallModal = () => {
    setShowCallModal(false);
  };

  const handleStartChatWithUser = (userId: string, userName: string) => {
    setSelectedChat(userId);
    setShowOnlineUsers(false);
  };

  const handleStartNewChat = (userId: string, userName: string) => {
    setSelectedChat(userId);
    setShowNewChatModal(false);
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-12rem)] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    console.log('New Chat button clicked');
                    console.log('Current showNewChatModal state:', showNewChatModal);
                    setShowNewChatModal(true);
                    console.log('Set showNewChatModal to true');
                  }}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                  className={`p-2 rounded-lg transition-colors ${
                    showOnlineUsers 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Online Users"
                >
                  <Users className="h-4 w-4" />
                </button>
                {connectionStatus === 'connected' && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi size={16} />
                    <span className="text-xs">Connected</span>
                  </div>
                )}
                {connectionStatus === 'connecting' && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Circle size={16} className="animate-pulse" />
                    <span className="text-xs">Connecting</span>
                  </div>
                )}
                {connectionStatus === 'disconnected' && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff size={16} />
                    <span className="text-xs">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.otherUserId}
                  onClick={() => setSelectedChat(conversation.otherUserId)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedChat === conversation.otherUserId ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.otherUserName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <User className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    No conversations yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedUserInfo?.name || 'Unknown User'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUserInfo?.lastMessageTime 
                        ? `Last message: ${formatTime(selectedUserInfo.lastMessageTime)}`
                        : 'Start a new conversation'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleStartCall('voice')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    onClick={() => handleStartCall('video')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Video size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      // TODO: Implement more options menu
                      alert('More options:\n• View Profile\n• Block User\n• Report User\n• Clear Chat');
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            <p className="text-xs">
                              {formatTime(message.sentAt)}
                            </p>
                            {isOwnMessage && (
                              <div className="flex items-center space-x-1">
                                {message.isRead ? (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        No messages yet
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <Smile size={20} />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Online Users Panel */}
        {showOnlineUsers && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700">
            <OnlineUsers onStartChat={handleStartChatWithUser} />
          </div>
        )}
      </div>
    </div>

    {/* Call Modal */}
    {showCallModal && selectedUserInfo && (
      <CallModal
        isOpen={showCallModal}
        callType={callType}
        callerName={selectedUserInfo.name}
        onClose={handleCloseCallModal}
      />
    )}

    {/* New Chat Modal */}
    {showNewChatModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" 
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '28rem',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden'
            }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Start New Chat
                </h2>
                <button
                  onClick={() => {
                    console.log('Closing modal');
                    setShowNewChatModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto" style={{backgroundColor: 'white'}}>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No connections yet
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Connect with other users to start chatting
                  </p>
                  <button 
                    onClick={() => refreshConnections()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Refresh Connections
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => {
                    const otherUser = connection.requesterId === user?.id ? connection.receiver : connection.requester;
                    if (!otherUser) return null;
                    
                    return (
                      <div
                        key={connection.id}
                        onClick={() => {
                          console.log('Starting chat with:', otherUser.id, otherUser.firstName, otherUser.lastName);
                          handleStartNewChat(otherUser.id, `${otherUser.firstName} ${otherUser.lastName}`);
                        }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {otherUser.profileImageUrl ? (
                            <img
                              src={otherUser.profileImageUrl}
                              alt={`${otherUser.firstName} ${otherUser.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {otherUser.email}
                          </p>
                        </div>
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;