import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Edit, 
  MapPin, 
  Globe, 
  Star, 
  Award, 
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Camera,
  Save,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { skillsService, UserSkill } from '../../services/skillsService';
import { reviewsService, Review } from '../../services/reviewsService';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    languages: user?.languages || [],
  });
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [skills, userReviews] = await Promise.all([
          skillsService.getUserSkills(user.id).catch(() => []),
          reviewsService.getReviewsForUser(user.id).catch(() => [])
        ]);
        
        setUserSkills(skills);
        setReviews(userReviews);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error loading profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        await updateUser(editData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile');
      }
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      languages: user?.languages || [],
    });
    setIsEditing(false);
  };

  // Separate skills by type
  const skillsOffered = userSkills.filter(skill => skill.type === 1); // 1 = Offered
  const skillsRequested = userSkills.filter(skill => skill.type === 2); // 2 = Requested

  const achievements = [
    { id: 1, name: 'Super Tutor', description: '50+ successful sessions', icon: Award, color: 'text-yellow-600' },
    { id: 2, name: 'Verified Expert', description: 'Identity and skills verified', icon: CheckCircle, color: 'text-green-600' },
    { id: 3, name: 'Community Helper', description: 'Highly rated by peers', icon: Star, color: 'text-blue-600' }
  ];

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Profile Photo */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                )}
              </div>

              {/* Rating and Stats */}
              <div className="flex justify-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.totalSessions}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.peerEndorsements}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Endorsements</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                {user.isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="Location"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.location}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {user.languages.map((lang) => (
                    <span key={lang} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className={`${achievement.color} bg-gray-100 dark:bg-gray-700 p-2 rounded-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Skills and Bio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About Me
            </h2>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Tell others about yourself, your interests, and what you're passionate about..."
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {user.bio || 'No bio available. Click "Edit Profile" to add one!'}
              </p>
            )}
          </div>

          {/* Skills Offered */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Skills I Offer
              </h2>
              <button 
                onClick={() => {
                  // This would typically navigate to the manage skills page
                  console.log('Navigate to manage skills');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Add Skill
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsOffered.length > 0 ? (
                skillsOffered.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{skill.skill.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{skill.skill.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        {skill.level}
                      </span>
                      {skill.hourlyRate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.hourlyRate} credits/hr
                        </span>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {skill.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No skills offered yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Skills Requested */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Skills I Want to Learn
              </h2>
              <button 
                onClick={() => {
                  // This would typically navigate to the manage skills page
                  console.log('Navigate to manage skills');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Add Request
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsRequested.length > 0 ? (
                skillsRequested.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{skill.skill.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{skill.skill.category}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 mt-2">
                      Looking for {skill.level} level
                    </span>
                    {skill.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {skill.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No skills requested yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;