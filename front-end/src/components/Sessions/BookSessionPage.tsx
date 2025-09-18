import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, Clock, MapPin, Video, User, DollarSign, MessageSquare, ArrowLeft, BookOpen } from 'lucide-react';
import { UserSkill } from '../../types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const schema = yup.object({
  scheduledStart: yup.string().required('Start time is required'),
  scheduledEnd: yup.string().required('End time is required'),
  notes: yup.string(),
  isOnline: yup.boolean(),
  location: yup.string().when('isOnline', {
    is: false,
    then: (schema) => schema.required('Location is required for in-person sessions'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type FormData = yup.InferType<typeof schema>;

const BookSessionPage: React.FC = () => {
  const { userSkillId } = useParams<{ userSkillId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userSkill, setUserSkill] = useState<UserSkill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      isOnline: true,
    },
  });

  const isOnline = watch('isOnline');
  const scheduledStart = watch('scheduledStart');
  const scheduledEnd = watch('scheduledEnd');

  useEffect(() => {
    if (userSkillId) {
      loadUserSkill();
    }
  }, [userSkillId]);

  const loadUserSkill = async () => {
    if (!userSkillId) return;

    try {
      setIsLoading(true);
      // In a real app, you'd have an endpoint to get a specific user skill
      // For now, we'll simulate this by searching
      const skills = await apiClient.searchSkills('', '', '');
      const skill = skills.find(s => s.id === parseInt(userSkillId));
      if (skill) {
        setUserSkill(skill);
      } else {
        toast.error('Skill not found');
        navigate('/discover');
      }
    } catch (error) {
      console.error('Failed to load skill:', error);
      toast.error('Failed to load skill details');
      navigate('/discover');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!scheduledStart || !scheduledEnd) return 0;
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60)); // hours
  };

  const calculateCost = () => {
    const duration = calculateDuration();
    return userSkill ? Math.ceil(duration * userSkill.creditsPerHour) : 0;
  };

  const onSubmit = async (data: FormData) => {
    if (!userSkill || !user) return;

    const cost = calculateCost();
    if (cost > user.creditBalance) {
      toast.error('Insufficient credits. Please add more credits to your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createSession({
        teacherId: userSkill.userId,
        userSkillId: userSkill.id,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        notes: data.notes,
        isOnline: data.isOnline,
        location: data.location,
      });

      toast.success('Session booked successfully!');
      navigate('/sessions');
    } catch (error: any) {
      console.error('Failed to book session:', error);
      toast.error(error.response?.data?.message || 'Failed to book session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userSkill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill not found</h3>
          <p className="text-gray-600">The skill you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Book Session</h1>
              <p className="text-blue-100">
                Schedule a learning session with {userSkill.user.firstName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{userSkill.skill.name}</h4>
                  <p className="text-sm text-gray-600">{userSkill.skill.category}</p>
                </div>

                {userSkill.description && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
                    <p className="text-sm text-gray-600">{userSkill.description}</p>
                  </div>
                )}

                {userSkill.requirements && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Requirements</h5>
                    <p className="text-sm text-gray-600">{userSkill.requirements}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    {userSkill.user.profileImageUrl ? (
                      <img
                        src={userSkill.user.profileImageUrl}
                        alt={`${userSkill.user.firstName} ${userSkill.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {userSkill.user.firstName} {userSkill.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{userSkill.user.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{userSkill.user.averageRating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-medium">{userSkill.user.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-medium">{userSkill.creditsPerHour} credits/hour</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Teacher</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border"
            >
              <div className="p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Your Session</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                        Start Date & Time *
                      </label>
                      <input
                        {...register('scheduledStart')}
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.scheduledStart && (
                        <p className="mt-1 text-sm text-red-600">{errors.scheduledStart.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                        End Date & Time *
                      </label>
                      <input
                        {...register('scheduledEnd')}
                        type="datetime-local"
                        min={scheduledStart || new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.scheduledEnd && (
                        <p className="mt-1 text-sm text-red-600">{errors.scheduledEnd.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Session Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="relative">
                        <input
                          {...register('isOnline')}
                          type="radio"
                          value="true"
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition-all">
                          <div className="flex items-center space-x-3">
                            <Video className="w-6 h-6 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Online Session</h4>
                              <p className="text-sm text-gray-600">Meet via video call</p>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          {...register('isOnline')}
                          type="radio"
                          value="false"
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition-all">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-6 h-6 text-green-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">In-Person Session</h4>
                              <p className="text-sm text-gray-600">Meet at a location</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Location (if in-person) */}
                  {!isOnline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-green-600" />
                        Meeting Location *
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter the meeting location"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any specific topics you'd like to focus on or questions you have..."
                    />
                  </div>

                  {/* Cost Summary */}
                  {scheduledStart && scheduledEnd && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        Session Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{calculateDuration().toFixed(1)} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate</span>
                          <span className="font-medium">{userSkill.creditsPerHour} credits/hour</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-900">Total Cost</span>
                          <span className="font-bold text-lg text-green-600">{calculateCost()} credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Balance</span>
                          <span className={`font-medium ${user && calculateCost() > user.creditBalance ? 'text-red-600' : 'text-gray-900'}`}>
                            {user?.creditBalance || 0} credits
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || (user && calculateCost() > user.creditBalance)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Booking Session...</span>
                        </div>
                      ) : (
                        'Book Session'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSessionPage;