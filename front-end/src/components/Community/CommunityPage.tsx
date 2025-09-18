import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Search,
  Loader2
} from 'lucide-react';
import { UserSkill, skillsService } from '../../services/skillsService';
import { userService, User as UserType } from '../../services/userService';

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'skills' | 'trending'>('users');
  const [users, setUsers] = useState<UserType[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load community data
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [usersData, skillsData] = await Promise.all([
          userService.getAllUsers(),
          skillsService.getAllAvailableUserSkills()
        ]);
        
        setUsers(usersData);
        setSkills(skillsData);
      } catch (err) {
        setError('Failed to load community data');
        console.error('Error loading community data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityData();
  }, []);

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredSkills = Array.isArray(skills) ? skills.filter(skill => 
    skill.skill?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.skill?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const trendingUsers = Array.isArray(users) ? users
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .slice(0, 6) : [];

  const trendingSkills = Array.isArray(skills) ? skills
    .filter(skill => skill.type === 1) // 1 = Offered
    .slice(0, 6) : [];

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getTypeText = (type: number) => {
    switch (type) {
      case 1: return 'Offered';
      case 2: return 'Requested';
      default: return 'Unknown';
    }
  };

  const renderStars = (rating: number | undefined) => {
    const safeRating = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(safeRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading community...</p>
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
          Community
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover skilled people and trending topics in your community
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users, skills, or topics..."
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
              { id: 'users', name: 'Users', icon: Users, count: filteredUsers.length },
              { id: 'skills', name: 'Skills', icon: BookOpen, count: filteredSkills.length },
              { id: 'trending', name: 'Trending', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(user.averageRating)}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {(user.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  {user.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{user.totalReviews} reviews</span>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {skill.skill?.name || 'Unknown Skill'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {skill.skill?.category || 'Uncategorized'}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        {getLevelText(skill.level)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {skill.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {skill.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.type === 1 ? 'Teaching' : 'Learning'}
                  </span>
                  {skill.creditsPerHour && (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {skill.creditsPerHour} credits/hr
                    </span>
                  )}
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  {skill.type === 1 ? 'Book Session' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top Contributors
            </h2>
            <div className="space-y-4">
              {trendingUsers.map((user, index) => (
                <div key={user.id} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.totalReviews} reviews
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(user.averageRating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {(user.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Popular Skills
            </h2>
            <div className="space-y-4">
              {trendingSkills.map((skill, index) => (
                <div key={skill.id} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {skill.skill?.name || 'Unknown Skill'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.skill?.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getLevelText(skill.level)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'users' && filteredUsers.length === 0) || 
        (activeTab === 'skills' && filteredSkills.length === 0)) && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No results found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
