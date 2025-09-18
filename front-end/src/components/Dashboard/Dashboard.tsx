import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Award,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Session, UserSkill, Review } from '../../types';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    offeredSkills: 0,
    requestedSkills: 0,
    averageRating: 0,
    totalReviews: 0,
    creditBalance: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [skillMatches, setSkillMatches] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load sessions
        const [mySessions, teachingSessions, learningSessions] = await Promise.all([
          apiClient.getMySessions(),
          apiClient.getTeachingSessions(),
          apiClient.getLearningSessions(),
        ]);

        // Load skills and matches
        const [mySkills, matches] = await Promise.all([
          apiClient.getUserSkills(user!.id),
          apiClient.getMyMatches(),
        ]);

        // Load recent reviews
        const reviews = await apiClient.getUserReviews(user!.id);

        // Calculate stats
        const upcoming = mySessions.filter(s => 
          new Date(s.scheduledStart) > new Date() && s.status === 1
        );
        const completed = mySessions.filter(s => s.status === 4);
        const offered = mySkills.filter(s => s.type === 1);
        const requested = mySkills.filter(s => s.type === 2);

        setStats({
          upcomingSessions: upcoming.length,
          completedSessions: completed.length,
          offeredSkills: offered.length,
          requestedSkills: requested.length,
          averageRating: user?.averageRating || 0,
          totalReviews: user?.totalReviews || 0,
          creditBalance: user?.creditBalance || 0,
        });

        setUpcomingSessions(upcoming.slice(0, 3));
        setRecentReviews(reviews.slice(0, 3));
        setSkillMatches(matches.slice(0, 4));

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const statCards = [
    {
      title: 'Credit Balance',
      value: stats.creditBalance,
      icon: Award,
      color: 'from-green-500 to-green-600',
      suffix: ' credits',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      suffix: '/5.0',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      suffix: ' sessions',
    },
    {
      title: 'Skills Offered',
      value: stats.offeredSkills,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      suffix: ' skills',
    },
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
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-blue-100 mt-2">
                Ready to share and learn new skills today?
              </p>
            </div>
            <Link
              to="/skills/add"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Skill</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix}
                    </p>
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
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Upcoming Sessions
                </h2>
                <Link
                  to="/sessions"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.userSkill.skill.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            with {session.teacherId === user?.id ? session.student.firstName : session.teacher.firstName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.scheduledStart).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.scheduledStart).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming sessions</p>
                  <Link
                    to="/discover"
                    className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Browse skills to book sessions
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Skill Matches */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Recommended Matches
                </h2>
                <Link
                  to="/discover"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {skillMatches.length > 0 ? (
                <div className="space-y-4">
                  {skillMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {match.skill.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            by {match.user.firstName} {match.user.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {match.creditsPerHour} credits/hr
                          </p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {match.user.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No matches found</p>
                  <Link
                    to="/skills/add"
                    className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Add skills to get recommendations
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-sm border"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              Recent Reviews
            </h2>
          </div>

          <div className="p-6">
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Complete sessions to receive reviews
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;