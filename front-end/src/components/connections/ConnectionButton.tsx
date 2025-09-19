import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Check, 
  Clock, 
  X, 
  MoreHorizontal,
  UserMinus,
  Shield
} from 'lucide-react';
import { useConnection } from '../../contexts/ConnectionContext';
import ConnectionRequestModal from './ConnectionRequestModal';

interface ConnectionButtonProps {
  targetUser: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onConnectionChange?: () => void;
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  targetUser,
  variant = 'primary',
  size = 'md',
  showText = true,
  onConnectionChange
}) => {
  const { 
    getConnectionStatus, 
    respondToConnectionRequest, 
    removeConnection,
    blockUser,
    isResponding,
    pendingRequests,
    connections
  } = useConnection();
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'sent' | 'none'>('none');

  useEffect(() => {
    const status = getConnectionStatus(targetUser.id);
    setConnectionStatus(status);
  }, [targetUser.id, getConnectionStatus]);

  const handleConnect = () => {
    setShowRequestModal(true);
  };

  const handleAcceptRequest = async () => {
    try {
      // Find the pending request
      const request = pendingRequests.find(req => req.requesterId === targetUser.id);
      
      if (request) {
        await respondToConnectionRequest({
          connectionId: request.id,
          status: 2 // Accepted
        });
        setConnectionStatus('connected');
        onConnectionChange?.();
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      // Find the pending request
      const request = pendingRequests.find(req => req.requesterId === targetUser.id);
      
      if (request) {
        await respondToConnectionRequest({
          connectionId: request.id,
          status: 3 // Declined
        });
        setConnectionStatus('none');
        onConnectionChange?.();
      }
    } catch (error) {
      console.error('Error declining connection request:', error);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      const connection = connections.find(conn => 
        (conn.requesterId === targetUser.id && conn.receiverId !== targetUser.id) ||
        (conn.requesterId !== targetUser.id && conn.receiverId === targetUser.id)
      );
      
      if (connection) {
        await removeConnection(connection.id);
        setConnectionStatus('none');
        onConnectionChange?.();
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const handleBlockUser = async () => {
    if (confirm(`Are you sure you want to block ${targetUser.firstName} ${targetUser.lastName}?`)) {
      try {
        await blockUser(targetUser.id);
        setConnectionStatus('none');
        onConnectionChange?.();
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    }
  };

  const getButtonContent = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Connected',
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Accept Request',
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'sent':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Request Sent',
          className: 'bg-gray-400 text-white cursor-not-allowed'
        };
      default:
        return {
          icon: <UserPlus className="h-4 w-4" />,
          text: 'Connect',
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const buttonContent = getButtonContent();
  const sizeClasses = getSizeClasses();
  const iconSize = getIconSize();

  const handleClick = () => {
    switch (connectionStatus) {
      case 'pending':
        handleAcceptRequest();
        break;
      case 'none':
        handleConnect();
        break;
      default:
        // For connected or sent, show menu
        setShowMenu(!showMenu);
        break;
    }
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={connectionStatus === 'sent' || isResponding}
          className={`p-2 rounded-full transition-colors ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              : connectionStatus === 'pending'
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
              : connectionStatus === 'sent'
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
          }`}
        >
          {React.cloneElement(buttonContent.icon, { className: iconSize })}
        </button>

        {/* Menu for connected users */}
        {showMenu && connectionStatus === 'connected' && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <button
              onClick={handleRemoveConnection}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <UserMinus className="h-4 w-4" />
              <span>Remove Connection</span>
            </button>
            <button
              onClick={handleBlockUser}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Block User</span>
            </button>
          </div>
        )}

        {/* Menu for pending requests */}
        {showMenu && connectionStatus === 'pending' && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <button
              onClick={handleAcceptRequest}
              className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Accept Request</span>
            </button>
            <button
              onClick={handleDeclineRequest}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Decline Request</span>
            </button>
          </div>
        )}

        <ConnectionRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          targetUser={targetUser}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={connectionStatus === 'sent' || isResponding}
        className={`${sizeClasses} rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${buttonContent.className} ${
          connectionStatus === 'sent' ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {React.cloneElement(buttonContent.icon, { className: iconSize })}
        {showText && <span>{buttonContent.text}</span>}
      </button>

      <ConnectionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        targetUser={targetUser}
      />
    </div>
  );
};

export default ConnectionButton;
