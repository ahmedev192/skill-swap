import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Star,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsService, CreateSessionRequest } from '../../services/sessionsService';
import api from '../../services/api';

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface UserSkill {
  id: number;
  skill: Skill | null;
  creditsPerHour: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    averageRating: number;
    totalReviews: number;
  } | null;
}

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionBooked?: () => void;
}

const BookSessionModal: React.FC<BookSessionModalProps> = ({ isOpen, onClose, onSessionBooked }) => {
  const { user } = useAuth();
  const [availableSkills, setAvailableSkills] = useState<UserSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingType, setMeetingType] = useState<'online' | 'in-person'>('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Load available skills
  useEffect(() => {
    const loadAvailableSkills = async () => {
      try {
        setIsLoadingSkills(true);
        
        // Get all offered skills from all users
        const userSkillsResponse = await api.get('/skills/offered');
        const userSkills = userSkillsResponse.data;
        
        setAvailableSkills(userSkills);
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    if (isOpen) {
      loadAvailableSkills();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSkill(null);
      setSelectedDate('');
      setSelectedTime('');
      setDuration(60);
      setMeetingType('online');
      setMeetingLink('');
      setLocation('');
      setNotes('');
    }
  }, [isOpen]);

  const handleBookSession = async () => {
    if (!selectedSkill || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedSkill.user?.id) {
      alert('Invalid skill selection. Please try again.');
      return;
    }

    if (meetingType === 'online' && !meetingLink) {
      alert('Please provide a meeting link for online sessions');
      return;
    }

    if (meetingType === 'in-person' && !location) {
      alert('Please provide a location for in-person sessions');
      return;
    }

    try {
      setIsLoading(true);
      
      const sessionData: CreateSessionRequest = {
        teacherId: selectedSkill.user.id,
        userSkillId: selectedSkill.id,
        scheduledStart: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        scheduledEnd: new Date(new Date(`${selectedDate}T${selectedTime}:00`).getTime() + duration * 60000).toISOString(),
        isOnline: meetingType === 'online',
        location: meetingType === 'in-person' ? location : undefined,
        notes: notes || undefined
      };

      console.log('Sending session data:', sessionData);
      await sessionsService.bookSession(sessionData);
      
      alert('Session booked successfully!');
      onClose();
      if (onSessionBooked) {
        onSessionBooked();
      }
    } catch (error: any) {
      console.error('Error booking session:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to book session. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Book a Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoadingSkills ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading available skills...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Skill Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Skill to Learn *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableSkills.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <p>No skills available for booking at the moment.</p>
                    <p className="text-sm mt-1">Please check back later or contact support.</p>
                  </div>
                ) : (
                  availableSkills
                    .filter(userSkill => userSkill.skill && userSkill.user) // Filter out any null skills or users
                    .map((userSkill) => (
                  <div
                    key={userSkill.id}
                    onClick={() => setSelectedSkill(userSkill)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSkill?.id === userSkill.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {userSkill.skill?.name || 'Unknown Skill'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userSkill.skill?.category || 'No Category'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userSkill.creditsPerHour} credits/hour
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {userSkill.user?.averageRating?.toFixed(1) || '0.0'} ({userSkill.user?.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Teacher: {userSkill.user?.firstName || 'Unknown'} {userSkill.user?.lastName || 'User'}
                    </p>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="online"
                    checked={meetingType === 'online'}
                    onChange={(e) => setMeetingType(e.target.value as 'online' | 'in-person')}
                    className="mr-2"
                  />
                  <Video className="h-4 w-4 mr-1" />
                  Online
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="in-person"
                    checked={meetingType === 'in-person'}
                    onChange={(e) => setMeetingType(e.target.value as 'online' | 'in-person')}
                    className="mr-2"
                  />
                  <MapPin className="h-4 w-4 mr-1" />
                  In-Person
                </label>
              </div>
            </div>

            {/* Meeting Link or Location */}
            {meetingType === 'online' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter meeting location"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics you'd like to cover or questions you have..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Cost Summary */}
            {selectedSkill && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Session Cost</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedSkill.creditsPerHour} credits/hour × {(duration / 60).toFixed(1)} hours
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(selectedSkill.creditsPerHour * (duration / 60))} credits
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSession}
                disabled={isLoading || !selectedSkill || !selectedDate || !selectedTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Booking...
                  </div>
                ) : (
                  'Book Session'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSessionModal;
