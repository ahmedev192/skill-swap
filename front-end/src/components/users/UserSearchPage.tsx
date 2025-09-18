import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  User, 
  MessageCircle,
  Calendar,
  Award,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserType } from '../../types';
import { userService } from '../../services/userService';

const UserSearchPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || user.location === selectedLocation;
    const matchesRating = selectedRating === 'all' || 
                         (selectedRating === '4+' && user.rating >= 4) ||
                         (selectedRating === '3+' && user.rating >= 3) ||
                         (selectedRating === '2+' && user.rating >= 2) ||
                         (selectedRating === '1+' && user.rating >= 1);
    
    return matchesSearch && matchesLocation && matchesRating;
  });

  const handleSendMessage = async (userId: string) => {
    // This would typically open a chat or redirect to messages
    console.log('Send message to user:', userId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const getUniqueLocations = () => {
    const locations = users.map(user => user.location).filter(Boolean);
    return Array.from(new Set(locations));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Find Users
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover skilled people in your community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, skills, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Locations</option>
              {getUniqueLocations().map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Ratings</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
              <option value="2+">2+ Stars</option>
              <option value="1+">1+ Stars</option>
            </select>

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredUsers.length} users
          </p>
        </div>
      </div>

      {/* Users Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(user.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.rating.toFixed(1)} ({user.totalSessions} sessions)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}

              {/* Location and Languages */}
              <div className="space-y-2 mb-4">
                {user.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.languages && user.languages.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Globe className="h-4 w-4" />
                    <div className="flex flex-wrap gap-1">
                      {user.languages.slice(0, 3).map((lang) => (
                        <span key={lang} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                          {lang}
                        </span>
                      ))}
                      {user.languages.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{user.languages.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{user.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>{user.peerEndorsements} endorsements</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSendMessage(user.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
                <button 
                  onClick={() => {
                    // TODO: Navigate to user profile page
                    alert(`Viewing profile of ${user.firstName} ${user.lastName}...`);
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No users found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSearchPage;
