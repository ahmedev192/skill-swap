import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Calendar, Star, TrendingUp, Award, BookOpen, Plus } from 'lucide-react';
import { User, UserSkill, Session } from '../../types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [popularSkills, setPopularSkills] = useState<UserSkill[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    completedSessions: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      
      // Load recommended users and skills
      const [recommendedUsers, recommendedSkills] = await Promise.all([
        apiClient.getRecommendedUsers(),
        apiClient.getRecommendedSkills()
      ]);

      setTopUsers(recommendedUsers.slice(0, 6));
      setPopularSkills(recommendedSkills.slice(0, 8));

      // Mock community stats (in real app, this would come from admin endpoint)
      setCommunityStats({
        totalUsers: 1250,
        totalSkills: 450,
        completedSessions: 3200,
        activeUsers: 180
      });

    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Members',
      value: communityStats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Skills Shared',
      value: communityStats.totalSkills.toLocaleString(),
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Sessions Completed',
      value: communityStats.completedSessions.toLocaleString(),
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: '+15%'
    },
    {
      title: 'Active This Week',
      value: communityStats.activeUsers.toLocaleString(),
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      change: '+5%'
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Community</h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with amazing people and discover new opportunities to learn and teach
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change} this month</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Community Members */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Community Members
                </h2>
                <Link
                  to="/discover"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {topUsers.map((member, index) => (
                  <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                            <span>{member.averageRating.toFixed(1)}</span>
                          </div>
                          <span>{member.totalReviews} reviews</span>
                          {member.location && (
                            <span>{member.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/users/${member.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Profile
                      </Link>
                      <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-white">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Popular Skills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Trending Skills
                </h2>
                <Link
                  to="/discover"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {popularSkills.map((skill, index) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{skill.skill.name}</p>
                        <p className="text-sm text-gray-600">{skill.skill.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {skill.creditsPerHour} credits/hr
                      </p>
                      <p className="text-xs text-gray-600">
                        by {skill.user.firstName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Community Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Ready to share your skills or learn something new? Connect with our amazing community of learners and teachers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/skills/add"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Share a Skill</span>
                </Link>
                <Link
                  to="/discover"
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Find Skills to Learn</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Be Respectful</h4>
                <p className="text-sm text-gray-600">
                  Treat all community members with kindness and respect
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Share Knowledge</h4>
                <p className="text-sm text-gray-600">
                  Help others learn and grow by sharing your expertise
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Stay Engaged</h4>
                <p className="text-sm text-gray-600">
                  Participate actively and provide constructive feedback
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;