import React, { useState, useEffect } from 'react';
import { 
  Star, 
  X, 
  Loader2,
  User,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsService } from '../../services/reviewsService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { getUserAvatarUrl } from '../../utils/avatarUtils';

interface Session {
  id: number;
  userSkill: {
    skill: {
      name: string;
      category: string;
    };
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    customAvatarUrl?: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    customAvatarUrl?: string;
  };
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  session, 
  onReviewSubmitted 
}) => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !user) return;

    // Validation
    if (rating === 0) {
      setErrors({ rating: 'Please select a rating' });
      return;
    }

    if (comment.trim().length < 10) {
      setErrors({ comment: 'Please write at least 10 characters' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const reviewData = {
        revieweeId: reviewee.id,
        sessionId: session.id,
        rating: rating,
        comment: comment.trim()
      };

      console.log('Submitting review data:', reviewData);
      await reviewsService.createReview(reviewData);
      
      alert('Review submitted successfully!');
      onClose();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      const errorResult = handleError(error, 'createReview');
      setErrors({ general: errorResult.userNotification.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewee = () => {
    if (!session || !user) return null;
    
    // If current user is the teacher, review the student
    // If current user is the student, review the teacher
    return user.id === session.teacher.id ? session.student : session.teacher;
  };

  const reviewee = getReviewee();

  if (!isOpen || !session || !reviewee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Leave a Review
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Session Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            {session.userSkill.skill.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
                {getUserAvatarUrl(reviewee) ? (
                  <img
                    src={getUserAvatarUrl(reviewee)!}
                    alt={`${reviewee.firstName} ${reviewee.lastName}`}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span>Reviewing: {reviewee.firstName} {reviewee.lastName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>{session.userSkill.skill.category}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate this session? *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating}</p>
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {rating === 0 && 'Click a star to rate'}
              {rating === 1 && 'Poor - Very disappointed'}
              {rating === 2 && 'Fair - Below expectations'}
              {rating === 3 && 'Good - Met expectations'}
              {rating === 4 && 'Very Good - Exceeded expectations'}
              {rating === 5 && 'Excellent - Outstanding experience'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share your experience *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this session. What went well? What could be improved?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                {comment.length}/500 characters
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Review Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be specific about what you learned or taught</li>
              <li>• Mention the teaching style and communication</li>
              <li>• Highlight any helpful resources or materials</li>
              <li>• Keep it constructive and respectful</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
