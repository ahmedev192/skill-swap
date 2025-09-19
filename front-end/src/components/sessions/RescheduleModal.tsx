import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  X, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sessionsService } from '../../services/sessionsService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { validateForm, sessionValidationRules } from '../../utils/validation';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  currentStart: string;
  currentEnd: string;
  onRescheduled: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  currentStart,
  currentEnd,
  onRescheduled
}) => {
  const { handleError } = useErrorHandler();
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with current session times
  React.useEffect(() => {
    if (isOpen) {
      const startDate = new Date(currentStart);
      const endDate = new Date(currentEnd);
      
      // Format for datetime-local input
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setNewStart(formatDateTime(startDate));
      setNewEnd(formatDateTime(endDate));
      setErrors({});
    }
  }, [isOpen, currentStart, currentEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      newStart: new Date(newStart).toISOString(),
      newEnd: new Date(newEnd).toISOString()
    };

    // Validate form
    const validationErrors = validateForm(formData, sessionValidationRules.rescheduleSession);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      await sessionsService.rescheduleSession(sessionId, formData);
      
      alert('Session rescheduled successfully!');
      onClose();
      onRescheduled();
    } catch (error) {
      const errorResult = handleError(error, 'rescheduleSession');
      setErrors({ general: errorResult.userNotification.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reschedule Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Start Time *
            </label>
            <input
              type="datetime-local"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              min={getMinDateTime()}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.newStart 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.newStart && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newStart}</p>
            )}
          </div>

          {/* New End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New End Time *
            </label>
            <input
              type="datetime-local"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              min={newStart || getMinDateTime()}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.newEnd 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.newEnd && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newEnd}</p>
            )}
          </div>

          {/* Current Session Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Current Session Time
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(currentStart).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(currentStart).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })} - {new Date(currentEnd).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
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
              disabled={isLoading || !newStart || !newEnd}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                'Reschedule Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
