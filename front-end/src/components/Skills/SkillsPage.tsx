import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, Clock, Star, User } from 'lucide-react';
import { Skill, User as UserType } from '../../types';
import { skillsService, UserSkill } from '../../services/skillsService';

const SkillsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>(['All Categories']);
  const [levels] = useState(['All Levels', 'Beginner', 'Intermediate', 'Expert']);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allSkills = await skillsService.getAllSkills();
        const uniqueCategories = ['All Categories', ...new Set(allSkills.map(skill => skill.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Load skills from API
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (searchTerm.trim()) {
          // Search skills
          const searchResults = await skillsService.searchSkills(
            searchTerm,
            selectedCategory === 'all' ? undefined : selectedCategory,
            undefined // location could be added later
          );
          setSkills(searchResults);
        } else {
          // Get all available user skills
          if (selectedCategory === 'all') {
            // Get all available user skills using a broad search
            const allSkills = await skillsService.getAllAvailableUserSkills();
            setSkills(allSkills);
          } else {
            // Search for skills in the specific category using a broad search term
            const categorySkills = await skillsService.searchSkills('a', selectedCategory);
            setSkills(categorySkills);
          }
        }
      } catch (err) {
        setError('Failed to load skills. Please try again.');
        console.error('Error loading skills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [searchTerm, selectedCategory]);

  // Use skills from API
  const displaySkills = skills;
  
  const filteredSkills = displaySkills.filter(skill => {
    // For API skills (UserSkill), use different property names
    const userSkill = skill as UserSkill;
    
    // Add null checks to prevent errors
    if (!userSkill.skill) {
      return false; // Skip skills without skill data
    }
    
    const matchesSearch = userSkill.skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (userSkill.skill.description && userSkill.skill.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || userSkill.skill.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || userSkill.level === selectedLevel;
    const matchesType = selectedType === 'all' || userSkill.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Discover Skills
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find skills to learn or share your expertise with others
          </p>
        </div>
        <button 
          onClick={() => {
            // Navigate to manage skills page
            window.location.href = '/manage-skills';
          }}
          className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your Skill
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search skills, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All Categories' ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {levels.map((level) => (
                <option key={level} value={level === 'All Levels' ? 'all' : level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="offering">Skills Offered</option>
              <option value="requesting">Skills Requested</option>
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
            {isLoading ? 'Loading skills...' : `Showing ${filteredSkills.length} skills`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Skills Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {skill.skill?.name || 'Unknown Skill'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {skill.skill?.category || 'Uncategorized'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                      {skill.level}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {skill.creditsPerHour || 0} credits
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">per hour</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {skill.skill?.description || skill.description || 'No description available'}
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      User ID: {skill.userId}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>Location not available</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      N/A
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No reviews
                  </p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Available</span>
                </div>
                <div className="flex space-x-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                    {skill.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  // Navigate to sessions page with the skill ID
                  window.location.href = `/sessions?skillId=${skill.id}&teacherId=${skill.userId}`;
                }}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No skills found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;