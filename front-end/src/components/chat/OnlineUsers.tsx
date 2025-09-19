import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Circle, 
  MessageCircle, 
  Clock,
  User
} from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { OnlineUser } from '../../services/signalRService';

interface OnlineUsersProps {
  onStartChat?: (userId: string, userName: string) => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ onStartChat }) => {
  const { onlineUsers, isConnected } = useMessaging();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = onlineUsers.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleStartChat = (user: OnlineUser) => {
    if (onStartChat) {
      onStartChat(user.userId, `${user.firstName} ${user.lastName}`);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Online Users
          </h3>
          <div className="flex items-center">
            <Circle 
              className={`h-2 w-2 mr-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`} 
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search online users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length > 0 ? (
          <div className="p-2">
            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer group"
                onClick={() => handleStartChat(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatLastSeen(user.lastSeen)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChat(user);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No users found' : 'No users online'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
