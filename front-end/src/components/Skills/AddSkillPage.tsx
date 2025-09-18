import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, BookOpen, Star, DollarSign, FileText, MapPin, Save, ArrowLeft } from 'lucide-react';
import { Skill, SkillType, SkillLevel } from '../../types';
import { apiClient } from '../../lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const schema = yup.object({
  skillId: yup.number().required('Please select a skill'),
  type: yup.number().required('Please select skill type'),
  level: yup.number().required('Please select skill level'),
  description: yup.string(),
  requirements: yup.string(),
  creditsPerHour: yup.number().min(1, 'Credits must be at least 1').required('Credits per hour is required'),
});

type FormData = yup.InferType<typeof schema>;

const AddSkillPage: React.FC = () => {
  const navigate = useNavigate();
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
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
      creditsPerHour: 5,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skills = await apiClient.getSkills();
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
      toast.error('Failed to load available skills');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.createUserSkill({
        skillId: data.skillId,
        type: data.type as SkillType,
        level: data.level as SkillLevel,
        description: data.description,
        requirements: data.requirements,
        creditsPerHour: data.creditsPerHour,
      });
      
      toast.success('Skill added successfully!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Failed to add skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillCategories = [...new Set(availableSkills.map(skill => skill.category))];

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Add New Skill</h1>
              <p className="text-blue-100">
                Share your expertise or request to learn something new
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Skill Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  What would you like to do?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      {...register('type')}
                      type="radio"
                      value={SkillType.Offered}
                      className="sr-only peer"
                    />
                    <div className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Offer a Skill</h4>
                          <p className="text-sm text-gray-600">Teach others and earn credits</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      {...register('type')}
                      type="radio"
                      value={SkillType.Requested}
                      className="sr-only peer"
                    />
                    <div className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Request a Skill</h4>
                          <p className="text-sm text-gray-600">Learn from others using credits</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Skill Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skill *
                </label>
                <select
                  {...register('skillId')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a skill...</option>
                  {skillCategories.map(category => (
                    <optgroup key={category} label={category}>
                      {availableSkills
                        .filter(skill => skill.category === category)
                        .map(skill => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {errors.skillId && (
                  <p className="mt-1 text-sm text-red-600">{errors.skillId.message}</p>
                )}
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedType == SkillType.Offered ? 'Your Skill Level' : 'Desired Learning Level'} *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="relative">
                    <input
                      {...register('level')}
                      type="radio"
                      value={SkillLevel.Beginner}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-green-300 transition-all text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Beginner</h4>
                      <p className="text-sm text-gray-600">Just starting out</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      {...register('level')}
                      type="radio"
                      value={SkillLevel.Intermediate}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:bg-yellow-50 hover:border-yellow-300 transition-all text-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Intermediate</h4>
                      <p className="text-sm text-gray-600">Some experience</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      {...register('level')}
                      type="radio"
                      value={SkillLevel.Expert}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Expert</h4>
                      <p className="text-sm text-gray-600">Highly experienced</p>
                    </div>
                  </label>
                </div>
                {errors.level && (
                  <p className="mt-2 text-sm text-red-600">{errors.level.message}</p>
                )}
              </div>

              {/* Credits Per Hour (only for offered skills) */}
              {selectedType == SkillType.Offered && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    Credits Per Hour *
                  </label>
                  <div className="relative">
                    <input
                      {...register('creditsPerHour')}
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">credits/hour</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    How many credits you want to earn per hour of teaching
                  </p>
                  {errors.creditsPerHour && (
                    <p className="mt-1 text-sm text-red-600">{errors.creditsPerHour.message}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-1 text-blue-600" />
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    selectedType == SkillType.Offered
                      ? "Describe your experience and what you can teach..."
                      : "Describe what you want to learn and your goals..."
                  }
                />
                <p className="mt-1 text-sm text-gray-600">
                  {selectedType == SkillType.Offered
                    ? "Help others understand what they'll learn from you"
                    : "Help teachers understand your learning objectives"
                  }
                </p>
              </div>

              {/* Requirements (only for offered skills) */}
              {selectedType == SkillType.Offered && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-purple-600" />
                    Requirements
                  </label>
                  <textarea
                    {...register('requirements')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any prerequisites or materials students should have..."
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Let students know what they need before starting
                  </p>
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
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding Skill...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Add Skill</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddSkillPage;