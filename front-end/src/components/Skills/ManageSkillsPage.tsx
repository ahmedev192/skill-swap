import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { skillsService, UserSkill } from '../../services/skillsService';

const ManageSkillsPage: React.FC = () => {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  // Load user skills and available skills
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [userSkillsData, availableSkillsData] = await Promise.all([
          skillsService.getUserSkills(user.id),
          skillsService.getAllSkills()
        ]);
        
        setUserSkills(userSkillsData);
        setAvailableSkills(availableSkillsData);
      } catch (err) {
        setError('Failed to load skills');
        console.error('Error loading skills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredSkills = userSkills.filter(skill => {
    const matchesSearch = skill.skill?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'Offering' && skill.type === 1) ||
                       (filterType === 'Requesting' && skill.type === 2);
    return matchesSearch && matchesType;
  });

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await skillsService.deleteUserSkill(skillId);
      setUserSkills(userSkills.filter(s => s.id !== skillId));
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete skill';
      setError(errorMessage);
    }
  };

  const handleToggleAvailability = async (skill: UserSkill) => {
    try {
      const updatedSkill = { ...skill, isAvailable: !skill.isAvailable };
      await skillsService.updateUserSkill(skill.id, { isAvailable: !skill.isAvailable });
      setUserSkills(userSkills.map(s => 
        s.id === skill.id ? updatedSkill : s
      ));
    } catch (error: any) {
      console.error('Error updating skill availability:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update skill availability';
      setError(errorMessage);
    }
  };

  const handleSubmitSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // Convert frontend values to backend enum values
    const typeMapping: { [key: string]: number } = {
      'Offering': 1, // Offered
      'Requesting': 2 // Requested
    };
    
    const levelMapping: { [key: string]: number } = {
      'Beginner': 1,
      'Intermediate': 2,
      'Expert': 3
    };

    const skillId = parseInt(formData.get('skillId') as string);
    const levelStr = formData.get('level') as string;
    const typeStr = formData.get('type') as string;
    const description = formData.get('description') as string;
    const requirements = formData.get('requirements') as string;
    const creditsPerHourStr = formData.get('creditsPerHour') as string;
    
    // Enhanced validation
    if (!skillId || skillId <= 0) {
      setError('Please select a valid skill');
      return;
    }

    if (!levelStr || !levelMapping[levelStr]) {
      setError('Please select a valid skill level');
      return;
    }

    if (!typeStr || !typeMapping[typeStr]) {
      setError('Please select a valid skill type');
      return;
    }

    if (!description || description.trim().length === 0) {
      setError('Please provide a description');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    const creditsPerHour = creditsPerHourStr ? parseFloat(creditsPerHourStr) : 1.0;
    if (isNaN(creditsPerHour) || creditsPerHour < 0.1 || creditsPerHour > 1000) {
      setError('Credits per hour must be a valid number between 0.1 and 1000');
      return;
    }

    const level = levelMapping[levelStr];
    const type = typeMapping[typeStr];

    const skillData = {
      skillId,
      level,
      type,
      description: description.trim(),
      requirements: requirements?.trim() || undefined,
      creditsPerHour,
    };

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingSkill) {
        // Update existing skill
        const updatedSkill = await skillsService.updateUserSkill(editingSkill.id, skillData);
        setUserSkills(userSkills.map(s => s.id === editingSkill.id ? updatedSkill : s));
      } else {
        // Create new skill
        const newSkill = await skillsService.createUserSkill(skillData);
        setUserSkills([...userSkills, newSkill]);
      }

      // Close modal and reset form
      setShowAddModal(false);
      setEditingSkill(null);
    } catch (error: any) {
      console.error('Error saving skill:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to save skill';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelText = (level: number | string) => {
    if (typeof level === 'string') {
      return level;
    }
    const levelNum = Number(level);
    switch (levelNum) {
      case 0:
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getTypeText = (type: number | string) => {
    if (typeof type === 'string') {
      return type;
    }
    const typeNum = Number(type);
    switch (typeNum) {
      case 1: return 'Offered';
      case 2: return 'Requested';
      default: return 'Unknown';
    }
  };

  const getLevelColor = (level: number | string) => {
    if (typeof level === 'string') {
      switch (level.toLowerCase()) {
        case 'beginner': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
        case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
        case 'expert': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
        default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      }
    }
    const levelNum = Number(level);
    switch (levelNum) {
      case 0:
      case 1: // Beginner
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 2: // Intermediate
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 3: // Expert
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: number | string) => {
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'offered': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
        case 'requested': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
        default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      }
    }
    const typeNum = Number(type);
    switch (typeNum) {
      case 1: // Offered
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 2: // Requested
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage My Skills
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add, edit, and manage your skills and requests
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
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
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="Offering">Skills I Offer</option>
            <option value="Requesting">Skills I Want</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredSkills.length} of {userSkills.length} skills
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {skill.skill?.name || 'Unknown Skill'}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(skill.type)}`}>
                      {getTypeText(skill.type)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getLevelColor(skill.level)}`}>
                      {getLevelText(skill.level)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingSkill(skill)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {skill.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {skill.description}
                </p>
              )}

              {/* Rate (for offerings) */}
              {skill.type === 1 && skill.creditsPerHour && (
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.creditsPerHour} credits/hour
                  </span>
                </div>
              )}

              {/* Availability Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {skill.isAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <button
                  onClick={() => handleToggleAvailability(skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    skill.isAvailable
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
                  }`}
                >
                  {skill.isAvailable ? 'Make Unavailable' : 'Make Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No skills found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search terms or filters'
              : 'You haven\'t added any skills yet'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Skill Modal */}
      {(showAddModal || editingSkill) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            
            <form onSubmit={handleSubmitSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skill
                </label>
                <select
                  name="skillId"
                  defaultValue={editingSkill?.skillId || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a skill...</option>
                  {availableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  defaultValue={editingSkill ? (editingSkill.type === 1 ? 'Offering' : 'Requesting') : 'Offering'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Offering">I can teach this</option>
                  <option value="Requesting">I want to learn this</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level
                </label>
                <select
                  name="level"
                  defaultValue={editingSkill ? getLevelText(editingSkill.level) : 'Beginner'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  minLength={10}
                  defaultValue={editingSkill?.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your experience or what you want to learn (minimum 10 characters)..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum 10 characters required
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  name="requirements"
                  rows={2}
                  defaultValue={editingSkill?.requirements || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Any specific requirements or prerequisites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate (Credits) *
                </label>
                <input
                  name="creditsPerHour"
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  required
                  defaultValue={editingSkill?.creditsPerHour || '1.0'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 10.0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be between 0.1 and 1000 credits per hour
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSkill(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (editingSkill ? 'Update' : 'Add') + ' Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSkillsPage;
