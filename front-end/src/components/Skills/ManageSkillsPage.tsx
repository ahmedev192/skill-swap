import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, EyeOff, BookOpen, Star, DollarSign, Users } from 'lucide-react';
import { UserSkill, SkillType, SkillLevel } from '../../types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageSkillsPage: React.FC = () => {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [activeTab, setActiveTab] = useState<'offered' | 'requested'>('offered');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSkills();
    }
  }, [user]);

  const loadUserSkills = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const skills = await apiClient.getUserSkills(user.id);
      setUserSkills(skills);
    } catch (error) {
      console.error('Failed to load user skills:', error);
      toast.error('Failed to load your skills');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkillAvailability = async (skillId: number, currentAvailability: boolean) => {
    try {
      await apiClient.updateUserSkill(skillId, { isAvailable: !currentAvailability });
      setUserSkills(prev =>
        prev.map(skill =>
          skill.id === skillId ? { ...skill, isAvailable: !currentAvailability } : skill
        )
      );
      toast.success(`Skill ${!currentAvailability ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to update skill availability:', error);
      toast.error('Failed to update skill availability');
    }
  };

  const deleteSkill = async (skillId: number) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      await apiClient.deleteUserSkill(skillId);
      setUserSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast.success('Skill deleted successfully');
    } catch (error) {
      console.error('Failed to delete skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const getSkillLevelText = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.Beginner: return 'Beginner';
      case SkillLevel.Intermediate: return 'Intermediate';
      case SkillLevel.Expert: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.Beginner: return 'bg-green-100 text-green-800';
      case SkillLevel.Intermediate: return 'bg-yellow-100 text-yellow-800';
      case SkillLevel.Expert: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const offeredSkills = userSkills.filter(skill => skill.type === SkillType.Offered);
  const requestedSkills = userSkills.filter(skill => skill.type === SkillType.Requested);

  const tabs = [
    { id: 'offered' as const, label: 'Skills I Offer', count: offeredSkills.length },
    { id: 'requested' as const, label: 'Skills I Want', count: requestedSkills.length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Skills</h1>
              <p className="text-blue-100">
                Manage your offered and requested skills
              </p>
            </div>
            <Link
              to="/skills/add"
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Skill</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          {activeTab === 'offered' && (
            <motion.div
              key="offered"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {offeredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offeredSkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {skill.skill.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {skill.skill.category}
                              {skill.skill.subCategory && ` • ${skill.skill.subCategory}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(skill.level)}`}>
                            {getSkillLevelText(skill.level)}
                          </span>
                        </div>

                        {skill.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {skill.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {skill.creditsPerHour} credits/hour
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              skill.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {skill.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleSkillAvailability(skill.id, skill.isAvailable)}
                              className={`p-2 rounded-lg transition-colors ${
                                skill.isAvailable
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={skill.isAvailable ? 'Disable skill' : 'Enable skill'}
                            >
                              {skill.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit skill"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSkill(skill.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete skill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <Link
                            to={`/sessions?skill=${skill.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                          >
                            <Users className="w-4 h-4" />
                            <span>View Sessions</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No skills offered yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start sharing your expertise with the community
                  </p>
                  <Link
                    to="/skills/add"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Offer Your First Skill
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'requested' && (
            <motion.div
              key="requested"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {requestedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requestedSkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {skill.skill.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {skill.skill.category}
                              {skill.skill.subCategory && ` • ${skill.skill.subCategory}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(skill.level)}`}>
                            {getSkillLevelText(skill.level)}
                          </span>
                        </div>

                        {skill.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {skill.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit skill"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSkill(skill.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete skill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <Link
                            to={`/discover?skill=${skill.skill.name}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Find Teachers</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No skills requested yet</h3>
                  <p className="text-gray-600 mb-6">
                    Tell the community what you'd like to learn
                  </p>
                  <Link
                    to="/skills/add"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Request Your First Skill
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageSkillsPage;