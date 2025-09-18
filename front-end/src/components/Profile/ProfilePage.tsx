import React, { useState, useEffect } from 'react';
import { User, Edit3, MapPin, Calendar, Star, Award, BookOpen, Clock, Save, X } from 'lucide-react';
import { UserSkill, Review, SkillType, SkillLevel } from '../../types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  bio: yup.string(),
  location: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offered' | 'requested' | 'reviews'>('offered');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user, reset]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [skillsData, reviewsData] = await Promise.all([
        apiClient.getUserSkills(user.id),
        apiClient.getUserReviews(user.id)
      ]);
      setUserSkills(skillsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await updateUser(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
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
    { id: 'reviews' as const, label: 'Reviews', count: reviews.length },
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex items-end space-x-6 -mt-16">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="flex-1 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2 text-gray-600">
                      {user?.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-yellow-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{user?.creditBalance || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Credits</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{user?.averageRating.toFixed(1) || '0.0'}</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{offeredSkills.length}</span>
                </div>
                <p className="text-sm text-gray-600">Skills Offered</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-green-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{user?.totalReviews || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        {...register('firstName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        {...register('lastName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">
                    {user?.bio || 'No bio available. Click "Edit Profile" to add one.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

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

          <div className="p-6">
            {activeTab === 'offered' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offeredSkills.length > 0 ? (
                  offeredSkills.map((skill) => (
                    <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.skill.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(skill.level)}`}>
                          {getSkillLevelText(skill.level)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{skill.skill.category}</p>
                      {skill.description && (
                        <p className="text-sm text-gray-700 mb-2">{skill.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{skill.creditsPerHour} credits/hour</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          skill.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {skill.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No skills offered yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requested' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestedSkills.length > 0 ? (
                  requestedSkills.map((skill) => (
                    <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{skill.skill.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{skill.skill.category}</p>
                      {skill.description && (
                        <p className="text-sm text-gray-700 mb-2">{skill.description}</p>
                      )}
                      <div className="text-sm text-gray-600">
                        Looking for {getSkillLevelText(skill.level).toLowerCase()} level
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No skills requested yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.reviewer.firstName} {review.reviewer.lastName}
                            </p>
                            <div className="flex items-center space-x-1">
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
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;