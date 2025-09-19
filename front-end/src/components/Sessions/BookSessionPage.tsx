import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Star,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsService } from '../../services/sessionsService';
import { UserSkill, skillsService } from '../../services/skillsService';

interface BookSessionPageProps {
  userSkillId?: string;
  onBack?: () => void;
}

const BookSessionPage: React.FC<BookSessionPageProps> = ({ userSkillId, onBack }) => {
  const { user } = useAuth();
  const [userSkill, setUserSkill] = useState<UserSkill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState<'in-person' | 'online'>('online');

  // Load user skill details
  useEffect(() => {
    const loadUserSkill = async () => {
      if (!userSkillId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the specific user skill by ID
        // Note: This assumes we have an endpoint to get user skill by ID
        // If not available, we need to implement it in the backend
        const userSkillData = await skillsService.getUserSkillById(parseInt(userSkillId));
        setUserSkill(userSkillData);
      } catch (err) {
        setError('Failed to load skill details');
        console.error('Error loading user skill:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSkill();
  }, [userSkillId]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userSkill || !user) return;
    
    try {
      setIsBooking(true);
      setError(null);
      
      const sessionData = {
        teacherId: userSkill.userId,
        userSkillId: userSkill.id,
        scheduledStart: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        scheduledEnd: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        notes: notes,
        isOnline: sessionType === 'online',
        location: sessionType === 'in-person' ? location : undefined
      };
      
      await sessionsService.createSession(sessionData);
      
      // Success - could redirect or show success message
      alert('Session booked successfully!');
      if (onBack) onBack();
      
    } catch (err) {
      setError('Failed to book session');
      console.error('Error booking session:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const totalCredits = userSkill ? (userSkill.creditsPerHour * (duration / 60)) : 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading session details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userSkill) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Skill not found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The skill you're trying to book is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Book Session
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Schedule a learning session with {userSkill.skill.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Session Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Session Details
            </h2>
            
            <form onSubmit={handleBookSession} className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
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

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSessionType('online')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      sessionType === 'online'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Video className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Online</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Video call session</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSessionType('in-person')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      sessionType === 'in-person'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <MapPin className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">In-Person</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Meet in person</p>
                  </button>
                </div>
              </div>

              {/* Location or Meeting Link */}
              {sessionType === 'online' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link (Optional)
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
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter meeting location"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific topics you'd like to cover or questions you have..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isBooking || !selectedDate || !selectedTime}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Book Session ({totalCredits} credits)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Session Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {userSkill.skill.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userSkill.skill.category} • {userSkill.level}
                </p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-900 dark:text-white">{duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                  <span className="text-gray-900 dark:text-white">{userSkill.creditsPerHour} credits/hour</span>
                </div>
                <div className="flex justify-between text-sm mt-2 font-medium">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">{totalCredits} credits</span>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Credits will be held in escrow until session completion
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSessionPage;
