import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, User } from 'lucide-react';
import { UserSkill, SkillLevel } from '../../types';
import { motion } from 'framer-motion';

interface SkillCardProps {
  userSkill: UserSkill;
  showUser?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ userSkill, showUser = true }) => {
  const getSkillLevelText = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.Beginner:
        return 'Beginner';
      case SkillLevel.Intermediate:
        return 'Intermediate';
      case SkillLevel.Expert:
        return 'Expert';
      default:
        return 'Unknown';
    }
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.Beginner:
        return 'bg-green-100 text-green-800';
      case SkillLevel.Intermediate:
        return 'bg-yellow-100 text-yellow-800';
      case SkillLevel.Expert:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {userSkill.skill.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {userSkill.skill.category}
              {userSkill.skill.subCategory && ` • ${userSkill.skill.subCategory}`}
            </p>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(
              userSkill.level
            )}`}
          >
            {getSkillLevelText(userSkill.level)}
          </span>
        </div>

        {/* Description */}
        {userSkill.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {userSkill.description}
          </p>
        )}

        {/* User Info */}
        {showUser && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userSkill.user.firstName} {userSkill.user.lastName}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {userSkill.user.averageRating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                    <span>{userSkill.user.averageRating.toFixed(1)}</span>
                  </div>
                )}
                {userSkill.user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{userSkill.user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requirements */}
        {userSkill.requirements && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
            <p className="text-sm text-gray-600">{userSkill.requirements}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {userSkill.creditsPerHour} credits/hour
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/users/${userSkill.userId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Profile
            </Link>
            <Link
              to={`/book-session/${userSkill.id}`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200"
            >
              Book Session
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;